import hashlib
import logging
from typing import Dict, Set
from datetime import datetime, timedelta
import json
import os

class DeduplicationEngine:
    """
    Prevents re-processing the same article multiple times.
    
    Uses three-layer detection:
    1. Exact URL matching
    2. Content hash matching (fuzzy duplicates)
    3. Title similarity (different URLs, same story)
    """
    
    def __init__(self, cache_file='dedup_cache.json', expiry_days=7):
        self.cache_file = cache_file
        self.expiry_days = expiry_days
        self.url_cache = set()
        self.content_hashes = {}  # {hash: timestamp}
        self.title_hashes = {}    # {hash: timestamp}
        self._load_cache()
    
    def _load_cache(self):
        """Load cache from disk"""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r') as f:
                    data = json.load(f)
                    self.url_cache = set(data.get('urls', []))
                    self.content_hashes = data.get('content_hashes', {})
                    self.title_hashes = data.get('title_hashes', {})
                    self._cleanup_expired()
            except:
                logging.warning("Failed to load dedup cache, starting fresh")
    
    def _save_cache(self):
        """Save cache to disk"""
        data = {
            'urls': list(self.url_cache),
            'content_hashes': self.content_hashes,
            'title_hashes': self.title_hashes
        }
        with open(self.cache_file, 'w') as f:
            json.dump(data, f)
    
    def _cleanup_expired(self):
        """Remove entries older than expiry_days"""
        cutoff = (datetime.now() - timedelta(days=self.expiry_days)).isoformat()
        
        # Clean content hashes
        expired = [h for h, ts in self.content_hashes.items() if ts < cutoff]
        for h in expired:
            del self.content_hashes[h]
        
        # Clean title hashes
        expired = [h for h, ts in self.title_hashes.items() if ts < cutoff]
        for h in expired:
            del self.title_hashes[h]
        
        logging.info(f"Cleaned up {len(expired)} expired cache entries")
    
    def _hash_content(self, text: str) -> str:
        """Generate hash of content"""
        # Normalize: lowercase, remove extra whitespace
        normalized = ' '.join(text.lower().split())
        return hashlib.md5(normalized.encode()).hexdigest()
    
    def _similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts (0-1)"""
        # Simple word-based similarity
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return intersection / union if union > 0 else 0.0
    
    def is_duplicate(self, article: Dict) -> Dict:
        """
        Check if article is a duplicate.
        
        Returns:
        {
            "is_duplicate": bool,
            "reason": "EXACT_URL" | "SIMILAR_CONTENT" | "SIMILAR_TITLE" | None,
            "similarity": 0.0-1.0
        }
        """
        url = article.get('url', '')
        title = article.get('title', '')
        content = article.get('content', article.get('title', ''))
        
        # Check 1: Exact URL match
        if url and url in self.url_cache:
            logging.info(f"Duplicate detected (URL): {title[:50]}...")
            return {
                "is_duplicate": True,
                "reason": "EXACT_URL",
                "similarity": 1.0
            }
        
        # Check 2: Content similarity (90%+ match = duplicate)
        content_hash = self._hash_content(content)
        for existing_hash, timestamp in self.content_hashes.items():
            # Simple hash comparison (could be enhanced with fuzzy matching)
            if content_hash == existing_hash:
                logging.info(f"Duplicate detected (Content): {title[:50]}...")
                return {
                    "is_duplicate": True,
                    "reason": "SIMILAR_CONTENT",
                    "similarity": 1.0
                }
        
        # Check 3: Title similarity (85%+ match = likely duplicate)
        title_hash = self._hash_content(title)
        for existing_hash, timestamp in self.title_hashes.items():
            if title_hash == existing_hash:
                logging.info(f"Duplicate detected (Title): {title[:50]}...")
                return {
                    "is_duplicate": True,
                    "reason": "SIMILAR_TITLE",
                    "similarity": 1.0
                }
        
        return {
            "is_duplicate": False,
            "reason": None,
            "similarity": 0.0
        }
    
    def mark_processed(self, article: Dict):
        """Mark article as processed"""
        url = article.get('url', '')
        title = article.get('title', '')
        content = article.get('content', article.get('title', ''))
        timestamp = datetime.now().isoformat()
        
        # Add to caches
        if url:
            self.url_cache.add(url)
        
        content_hash = self._hash_content(content)
        self.content_hashes[content_hash] = timestamp
        
        title_hash = self._hash_content(title)
        self.title_hashes[title_hash] = timestamp
        
        # Save to disk
        self._save_cache()
        
        logging.debug(f"Marked as processed: {title[:50]}...")
    
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        return {
            "total_urls": len(self.url_cache),
            "total_content_hashes": len(self.content_hashes),
            "total_title_hashes": len(self.title_hashes),
            "expiry_days": self.expiry_days
        }
    
    def reset_cache(self):
        """Clear all caches (for testing/debugging)"""
        self.url_cache = set()
        self.content_hashes = {}
        self.title_hashes = {}
        self._save_cache()
        logging.warning("Deduplication cache reset")

if __name__ == "__main__":
    print("--- DEDUPLICATION ENGINE TEST ---")
    
    dedup = DeduplicationEngine()
    
    # Test article
    article1 = {
        "url": "https://example.com/news/1",
        "title": "Tesla raises $5B in new funding",
        "content": "Tesla announced today that it has raised $5 billion in a new funding round..."
    }
    
    # Check first time (should not be duplicate)
    result = dedup.is_duplicate(article1)
    print(f"First check: {result}")
    
    # Mark as processed
    dedup.mark_processed(article1)
    
    # Check again (should be duplicate)
    result = dedup.is_duplicate(article1)
    print(f"Second check: {result}")
    
    # Test similar article (different URL, same content)
    article2 = {
        "url": "https://different.com/news/2",
        "title": "Tesla raises $5B in new funding",
        "content": "Tesla announced today that it has raised $5 billion in a new funding round..."
    }
    
    result = dedup.is_duplicate(article2)
    print(f"Similar article check: {result}")
    
    # Stats
    print(f"\nCache stats: {dedup.get_stats()}")
