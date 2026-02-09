"""
Dynamic News Scraper with Configurable Scheduling

Features:
- User-configurable refresh interval
- User-configurable runtime duration
- Start/Stop controls
- Status monitoring
"""

import threading
import time
import logging
from datetime import datetime, timedelta
from typing import Optional
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)


class DynamicScraper:
    def __init__(self, scraper, analyzer, memory, extractor, content_fetcher):
        self.scraper = scraper
        self.analyzer = analyzer
        self.memory = memory
        self.extractor = extractor
        self.content_fetcher = content_fetcher
        
        self.is_running = False
        self.thread: Optional[threading.Thread] = None
        # Persist config alongside other backend data
        self.config_file = os.path.join(DATA_DIR, "scraper_config.json")
        
        # Default configuration
        self.config = {
            "interval_minutes": 30,  # Default: scrape every 30 minutes
            "runtime_hours": 0,      # 0 = run indefinitely
            "auto_start": False
        }
        
        self._load_config()
        
        # Statistics
        self.stats = {
            "started_at": None,
            "last_run": None,
            "total_runs": 0,
            "total_articles": 0,
            "total_stories": 0,
            "errors": 0
        }
    
    def _load_config(self):
        """Load configuration from file"""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    saved_config = json.load(f)
                    self.config.update(saved_config)
            except Exception as e:
                logging.error(f"Failed to load scraper config: {e}")
    
    def _save_config(self):
        """Save configuration to file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            logging.error(f"Failed to save scraper config: {e}")
    
    def update_config(self, interval_minutes: int = None, runtime_hours: int = None, auto_start: bool = None):
        """Update scraper configuration"""
        if interval_minutes is not None:
            if interval_minutes < 1:
                raise ValueError("Interval must be at least 1 minute")
            self.config["interval_minutes"] = interval_minutes
        
        if runtime_hours is not None:
            if runtime_hours < 0:
                raise ValueError("Runtime cannot be negative")
            self.config["runtime_hours"] = runtime_hours
        
        if auto_start is not None:
            self.config["auto_start"] = auto_start
        
        self._save_config()
        logging.info(f"Scraper config updated: {self.config}")
    
    def start(self):
        """Start the dynamic scraper"""
        if self.is_running:
            logging.warning("Scraper is already running")
            return {"success": False, "message": "Scraper already running"}
        
        self.is_running = True
        self.stats["started_at"] = datetime.now().isoformat()
        self.stats["total_runs"] = 0
        self.stats["total_articles"] = 0
        self.stats["total_stories"] = 0
        self.stats["errors"] = 0
        
        self.thread = threading.Thread(target=self._scrape_loop, daemon=True)
        self.thread.start()
        
        logging.info(f"Dynamic scraper started - Interval: {self.config['interval_minutes']}min, Runtime: {self.config['runtime_hours']}hrs")
        
        return {
            "success": True,
            "message": "Scraper started",
            "config": self.config,
            "started_at": self.stats["started_at"]
        }
    
    def stop(self):
        """Stop the dynamic scraper"""
        if not self.is_running:
            logging.warning("Scraper is not running")
            return {"success": False, "message": "Scraper not running"}
        
        self.is_running = False
        
        if self.thread:
            self.thread.join(timeout=5)
        
        logging.info("Dynamic scraper stopped")
        
        return {
            "success": True,
            "message": "Scraper stopped",
            "stats": self.get_stats()
        }
    
    def _scrape_loop(self):
        """Main scraping loop"""
        start_time = datetime.now()
        runtime_limit = None
        
        if self.config["runtime_hours"] > 0:
            runtime_limit = start_time + timedelta(hours=self.config["runtime_hours"])
        
        logging.info(f"Scraper loop started. Will run until {'indefinitely' if runtime_limit is None else runtime_limit}")
        
        while self.is_running:
            # Check runtime limit
            if runtime_limit and datetime.now() >= runtime_limit:
                logging.info(f"Runtime limit reached ({self.config['runtime_hours']} hours)")
                self.is_running = False
                break
            
            # Perform scrape
            try:
                self._perform_scrape()
            except Exception as e:
                logging.error(f"Scrape error: {e}")
                self.stats["errors"] += 1
            
            # Wait for next interval
            if self.is_running:
                wait_seconds = self.config["interval_minutes"] * 60
                logging.info(f"Next scrape in {self.config['interval_minutes']} minutes...")
                
                # Sleep in small chunks to allow quick stop
                for _ in range(wait_seconds):
                    if not self.is_running:
                        break
                    time.sleep(1)
    
    def _perform_scrape(self):
        """Perform a single scrape cycle"""
        logging.info("🔄 Starting scrape cycle...")
        self.stats["last_run"] = datetime.now().isoformat()
        self.stats["total_runs"] += 1
        
        # Fetch articles
        articles = self.scraper.fetch_articles()
        self.stats["total_articles"] += len(articles)
        
        logging.info(f"📰 Fetched {len(articles)} articles")
        
        new_stories = []
        
        for article in articles:
            try:
                # Fetch full content
                full_content = self.content_fetcher.fetch_content(article['url'])
                if full_content:
                    article['content'] = full_content
                else:
                    article['content'] = article['title']
                
                # Extract entities
                entities = self.extractor.extract_entities(article.get('content', article['title']))
                
                # Analyze
                analysis_result = self.analyzer.analyze_news(article, entities)
                
                # Update memory
                story = self.memory.update_story(article, analysis_result, entities)
                new_stories.append(story['main_topic'])
            
            except Exception as e:
                logging.error(f"Error processing article: {e}")
                self.stats["errors"] += 1
        
        self.stats["total_stories"] += len(new_stories)
        
        logging.info(f"✅ Scrape complete - {len(new_stories)} stories updated")
    
    def get_status(self):
        """Get current scraper status"""
        return {
            "is_running": self.is_running,
            "config": self.config,
            "stats": self.stats,
            "next_run": self._calculate_next_run()
        }
    
    def get_stats(self):
        """Get scraper statistics"""
        return self.stats.copy()
    
    def _calculate_next_run(self):
        """Calculate when the next scrape will occur"""
        if not self.is_running or not self.stats["last_run"]:
            return None
        
        last_run = datetime.fromisoformat(self.stats["last_run"])
        next_run = last_run + timedelta(minutes=self.config["interval_minutes"])
        
        return next_run.isoformat()
