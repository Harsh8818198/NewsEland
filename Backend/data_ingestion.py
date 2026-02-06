import requests
from bs4 import BeautifulSoup
import spacy
import logging
import os
from typing import List, Dict
from abc import ABC, abstractmethod

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- BRAIN 1 (PART A): DATA SOURCE ADAPTERS ---

class BaseNewsSource(ABC):
    """Abstract Base Class for all News Sources"""
    @abstractmethod
    def fetch(self) -> List[Dict]:
        pass

class TechCrunchScraper(BaseNewsSource):
    """Original Web Scraper for TechCrunch"""
    def __init__(self):
        self.url = "https://techcrunch.com/"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

    def fetch(self) -> List[Dict]:
        articles = []
        try:
            logging.info(f"Scraping source: {self.url}")
            response = requests.get(self.url, headers=self.headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                for item in soup.select('.loop-card__title'):
                    link = item.find('a')
                    if link:
                        title = link.get_text().strip()
                        url = link.get('href')
                        articles.append({
                            'title': title,
                            'url': url,
                            'source': 'TechCrunch'
                        })
                logging.info(f"[TechCrunch] Found {len(articles)} articles.")
            else:
                logging.warning(f"[TechCrunch] Failed. Status: {response.status_code}")
        except Exception as e:
            logging.error(f"[TechCrunch] Error: {e}")
        return articles

class NewsAPIProvider(BaseNewsSource):
    """Integration with NewsAPI.org"""
    def __init__(self):
        self.api_key = os.getenv('NEWS_API_KEY')
        self.url = "https://newsapi.org/v2/top-headlines"

    def fetch(self) -> List[Dict]:
        articles = []
        if not self.api_key:
            logging.warning("[NewsAPI] No API Key found in .env. Skipping.")
            return []

        try:
            logging.info("[NewsAPI] Fetching top business headlines...")
            params = {
                'country': 'us',
                'category': 'business',
                'apiKey': self.api_key
            }
            response = requests.get(self.url, params=params, timeout=10)
            data = response.json()
            
            if data.get('status') == 'ok':
                for item in data.get('articles', [])[:10]: # Limit to top 10
                    if item.get('title') and item.get('url'):
                        articles.append({
                            'title': item['title'],
                            'url': item['url'],
                            'source': f"NewsAPI ({item.get('source', {}).get('name', 'Unknown')})"
                        })
                logging.info(f"[NewsAPI] Found {len(articles)} articles.")
            else:
                logging.error(f"[NewsAPI] Error: {data.get('message')}")
        except Exception as e:
            logging.error(f"[NewsAPI] Connection Error: {e}")
        return articles

class AlphaVantageProvider(BaseNewsSource):
    """Integration with Alpha Vantage (Financial News)"""
    def __init__(self):
        self.api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        self.url = "https://www.alphavantage.co/query"

    def fetch(self) -> List[Dict]:
        articles = []
        if not self.api_key:
            logging.warning("[AlphaVantage] No API Key found in .env. Skipping.")
            return []

        try:
            logging.info("[AlphaVantage] Fetching market news...")
            params = {
                'function': 'NEWS_SENTIMENT',
                'topics': 'technology,financial_markets', # Targeted topics
                'limit': '10',
                'apikey': self.api_key
            }
            response = requests.get(self.url, params=params, timeout=10)
            data = response.json()
            
            if 'feed' in data:
                for item in data['feed']:
                    if item.get('title') and item.get('url'):
                        articles.append({
                            'title': item['title'],
                            'url': item['url'],
                            'source': f"AlphaVantage ({item.get('source')})"
                        })
                logging.info(f"[AlphaVantage] Found {len(articles)} articles.")
            else:
                # Alpha Vantage often hits rate limits on free tier (25 req/day?)
                logging.warning(f"[AlphaVantage] No feed found (Check Rate Limit?). Response: {str(data)[:100]}")
        except Exception as e:
            logging.error(f"[AlphaVantage] Connection Error: {e}")
        return articles

class NewsScraper:
    """
    BRAIN 1: The Omniscient Observer (Part A) - AGGREGATOR
    Fetches raw news content from ALL configured sources.
    """
    def __init__(self):
        self.sources: List[BaseNewsSource] = [
            TechCrunchScraper(),
            NewsAPIProvider(),
            AlphaVantageProvider()
        ]

    def fetch_articles(self) -> List[Dict]:
        """
        Aggregates articles from all sources.
        """
        all_articles = []
        for source in self.sources:
            try:
                # Add a small delay between sources to be polite/safe
                # time.sleep(1) 
                new_articles = source.fetch()
                all_articles.extend(new_articles)
            except Exception as e:
                logging.error(f"Source Aggregation Failed: {e}")
        
        # Deduplicate by URL
        seen_urls = set()
        unique_articles = []
        for art in all_articles:
            if art['url'] not in seen_urls:
                unique_articles.append(art)
                seen_urls.add(art['url'])
        
        logging.info(f"Total Unique Articles Aggregated: {len(unique_articles)}")
        return unique_articles

class EntityExtractor:
    """
    BRAIN 1: The Omniscient Observer (Part B)
    Identifying WHO and WHAT the news is about.
    """
    def __init__(self):
        try:
            # Silence massive SpaCy logs if needed
            self.nlp = spacy.load("en_core_web_sm")
            logging.info("spaCy model loaded successfully.")
        except OSError:
            logging.error("SpaCy model 'en_core_web_sm' not found. Please run: python -m spacy download en_core_web_sm")
            self.nlp = None

    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """
        Extracts Organizations, GPE (Countries/Cities), and Products from text.
        """
        if not self.nlp:
            return {
                "ORG": [],
                "GPE": [],
                "PRODUCT": [],
                "PERSON": []
            }

        doc = self.nlp(text)
        entities = {
            "ORG": [], # Companies, agencies, institutions
            "GPE": [], # Geopolitical entities
            "PRODUCT": [], # Products
            "PERSON": [] # People (CEOs, etc.)
        }

        for ent in doc.ents:
            if ent.label_ in entities:
                if ent.text not in entities[ent.label_]: # Deduplicate
                    entities[ent.label_].append(ent.text)
        
        return entities

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv(override=True) # Load .env for testing
    
    print("--- BRAIN 1: MULTI-SOURCE TEST ---")
    
    scraper = NewsScraper()
    raw_news = scraper.fetch_articles()
    
    print(f"\n[Analzying {len(raw_news)} Articles]")
    
    # Count by source
    counts = {}
    for art in raw_news:
        src = art['source'].split(' (')[0] # Get base source name
        counts[src] = counts.get(src, 0) + 1
    
    print("\n📊 Source Summary:")
    for src, count in counts.items():
        print(f"   - {src}: {count}")

    print("\n📰 Sample Articles (1 per source):")
    # Show one from each source
    seen_sources = set()
    for article in raw_news:
        src = article['source'].split(' (')[0]
        if src not in seen_sources:
            print(f"   [{article['source']}] {article['title']}")
            seen_sources.add(src)
