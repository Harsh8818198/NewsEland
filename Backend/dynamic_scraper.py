"""
Dynamic News Scraper with Configurable Scheduling

Features:
- User-configurable refresh interval
- User-configurable runtime duration
- Start/Stop controls
- Status monitoring
- Immediate stop on Ctrl+C
"""

import threading
import time
import logging
import signal
import sys
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
        self.stop_event = threading.Event()  # For immediate stop signal
        self.thread: Optional[threading.Thread] = None
        # Persist config alongside other backend data
        self.config_file = os.path.join(DATA_DIR, "scraper_config.json")
        
        # Default configuration
        self.config = {
            "interval_minutes": 30,  # Default: scrape every 30 minutes
            "runtime_hours": 0,      # 0 = run indefinitely
            "runtime_minutes": 0,    # Additional minutes (added to hours)
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
                    # Ensure runtime_minutes exists (for backward compatibility)
                    if 'runtime_minutes' not in self.config:
                        self.config['runtime_minutes'] = 0
            except Exception as e:
                logging.error(f"Failed to load scraper config: {e}")
    
    def _save_config(self):
        """Save configuration to file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            logging.error(f"Failed to save scraper config: {e}")
    
    def update_config(self, interval_minutes: int = None, runtime_hours: int = None, runtime_minutes: int = None, auto_start: bool = None):
        """Update scraper configuration"""
        logging.info(f"Updating config - interval: {interval_minutes}, hours: {runtime_hours}, minutes: {runtime_minutes}, auto_start: {auto_start}")
        
        if interval_minutes is not None:
            if interval_minutes < 1:
                raise ValueError("Interval must be at least 1 minute")
            self.config["interval_minutes"] = interval_minutes
        
        if runtime_hours is not None:
            if runtime_hours < 0:
                raise ValueError("Runtime hours cannot be negative")
            self.config["runtime_hours"] = runtime_hours
        
        if runtime_minutes is not None:
            if runtime_minutes < 0 or runtime_minutes > 59:
                raise ValueError("Runtime minutes must be between 0 and 59")
            self.config["runtime_minutes"] = runtime_minutes
        
        if auto_start is not None:
            self.config["auto_start"] = auto_start
        
        self._save_config()
        logging.info(f"Scraper config updated and saved: {self.config}")
    
    def start(self):
        """Start the dynamic scraper"""
        if self.is_running:
            logging.warning("Scraper is already running")
            return {"success": False, "message": "Scraper already running"}
        
        self.is_running = True
        self.stop_event.clear()  # Clear the stop signal
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
        """Stop the dynamic scraper immediately"""
        if not self.is_running:
            logging.warning("Scraper is not running")
            return {"success": False, "message": "Scraper not running"}
        
        logging.warning("🛑 STOP SIGNAL RECEIVED - Stopping scraper immediately...")
        
        # Set both flags immediately
        self.is_running = False
        self.stop_event.set()
        
        # Force log the stop
        logging.warning("⏹️ Scraper flags set to STOP. Thread will halt at next checkpoint.")
        
        if self.thread and self.thread.is_alive():
            # Give it 1 second to stop gracefully
            self.thread.join(timeout=1)
            if self.thread.is_alive():
                logging.warning("⚠️ Scraper thread still running (will terminate at next checkpoint)")
        
        logging.info("✅ Stop command completed")
        
        return {
            "success": True,
            "message": "Scraper stopped",
            "stats": self.get_stats()
        }
    
    def _scrape_loop(self):
        """Main scraping loop"""
        start_time = datetime.now()
        runtime_limit = None
        
        # Calculate total runtime from hours + minutes
        total_runtime_minutes = (self.config["runtime_hours"] * 60) + self.config.get("runtime_minutes", 0)
        
        if total_runtime_minutes > 0:
            runtime_limit = start_time + timedelta(minutes=total_runtime_minutes)
            logging.info(f"Scraper will run for {self.config['runtime_hours']}h {self.config.get('runtime_minutes', 0)}m (until {runtime_limit.strftime('%H:%M:%S')})")
        else:
            logging.info("Scraper will run indefinitely")
        
        # Store runtime_limit for use in _perform_scrape
        self.runtime_limit = runtime_limit
        
        while self.is_running and not self.stop_event.is_set():
            # Check runtime limit
            if runtime_limit and datetime.now() >= runtime_limit:
                logging.info(f"Runtime limit reached ({self.config['runtime_hours']}h {self.config.get('runtime_minutes', 0)}m)")
                self.is_running = False
                break
            
            # Perform scrape
            try:
                self._perform_scrape()
            except Exception as e:
                logging.error(f"Scrape error: {e}")
                self.stats["errors"] += 1
            
            # Check if stopped during scrape
            if not self.is_running or self.stop_event.is_set():
                logging.info("⏹️ Stop detected after scrape cycle")
                break
            
            # Wait for next interval (check stop signal frequently)
            if self.is_running:
                wait_seconds = self.config["interval_minutes"] * 60
                logging.info(f"Next scrape in {self.config['interval_minutes']} minutes...")
                
                # Sleep in 1-second chunks to allow quick stop
                for _ in range(wait_seconds):
                    if not self.is_running or self.stop_event.is_set():
                        logging.info("⏹️ Stop detected during wait period")
                        break
                    time.sleep(1)
        
        logging.info("🏁 Scraper loop ended")
    
    def _perform_scrape(self):
        """Perform a single scrape cycle"""
        # Check stop signal before even starting
        if not self.is_running or self.stop_event.is_set():
            logging.warning("⏹️ STOP SIGNAL - Aborting scrape before it starts")
            return
        
        logging.info("🔄 Starting scrape cycle...")
        self.stats["last_run"] = datetime.now().isoformat()
        self.stats["total_runs"] += 1
        
        # Fetch articles
        articles = self.scraper.fetch_articles()
        
        # Check stop signal immediately after fetching
        if not self.is_running or self.stop_event.is_set():
            logging.warning("⏹️ STOP SIGNAL - Aborting after article fetch")
            return
        
        self.stats["total_articles"] += len(articles)
        
        logging.info(f"📰 Fetched {len(articles)} articles")
        
        new_stories = []
        
        for i, article in enumerate(articles):
            # Check stop signal AND runtime limit immediately at start of loop
            if not self.is_running or self.stop_event.is_set():
                logging.warning(f"⏹️ STOP SIGNAL - Halting immediately. Processed {i}/{len(articles)} articles.")
                break
            
            # Check runtime limit
            if hasattr(self, 'runtime_limit') and self.runtime_limit and datetime.now() >= self.runtime_limit:
                logging.warning(f"⏱️ RUNTIME LIMIT REACHED - Stopping mid-cycle. Processed {i}/{len(articles)} articles.")
                self.is_running = False
                break
            
            try:
                # Fetch full content
                full_content = self.content_fetcher.fetch_content(article['url'])
                if full_content:
                    article['content'] = full_content
                else:
                    article['content'] = article['title']
                
                # Check stop signal before expensive analysis
                if not self.is_running or self.stop_event.is_set():
                    logging.warning(f"⏹️ STOP SIGNAL - Halting before analysis. Processed {i}/{len(articles)} articles.")
                    break
                
                # Extract entities
                entities = self.extractor.extract_entities(article.get('content', article['title']))
                
                # Final check before analysis (most expensive operation)
                if not self.is_running or self.stop_event.is_set():
                    logging.warning(f"⏹️ STOP SIGNAL - Halting before AI analysis. Processed {i}/{len(articles)} articles.")
                    break
                
                # Analyze (this is the slow part)
                analysis_result = self.analyzer.analyze_news(article, entities)
                
                # Check immediately after analysis
                if not self.is_running or self.stop_event.is_set():
                    logging.warning(f"⏹️ STOP SIGNAL - Halting after analysis. Processed {i+1}/{len(articles)} articles.")
                    break
                
                # Update memory
                story = self.memory.update_story(article, analysis_result, entities)
                new_stories.append(story['main_topic'])
            
            except Exception as e:
                logging.error(f"Error processing article: {e}")
                self.stats["errors"] += 1
                # Check stop signal even on error
                if not self.is_running or self.stop_event.is_set():
                    logging.warning(f"⏹️ STOP SIGNAL - Halting after error. Processed {i}/{len(articles)} articles.")
                    break
        
        self.stats["total_stories"] += len(new_stories)
        
        if self.is_running and not self.stop_event.is_set():
            logging.info(f"✅ Scrape complete - {len(new_stories)} stories updated")
        else:
            logging.warning(f"⏹️ Scrape INTERRUPTED - {len(new_stories)} stories updated before stop")
    
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
