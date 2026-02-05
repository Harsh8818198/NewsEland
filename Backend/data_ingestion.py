import requests
from bs4 import BeautifulSoup
import spacy
import logging
from typing import List, Dict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class NewsScraper:
    """
    BRAIN 1: The Omniscient Observer (Part A)
    Fetches raw news content from selected sources.
    """
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.sources = [
            "https://techcrunch.com/", 
        ]

    def fetch_articles(self) -> List[Dict]:
        """
        Fetches latest articles from configured sources.
        Returns a list of raw article dictionaries: {'title': str, 'url': str, 'source': str}
        """
        articles = []
        for source in self.sources:
            try:
                logging.info(f"Scraping source: {source}")
                response = requests.get(source, headers=self.headers, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    if "techcrunch.com" in source:
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
                                
                    logging.info(f"Found {len(articles)} articles so far.")
                else:
                    logging.warning(f"Failed to fetch {source}: Status {response.status_code}")
            except Exception as e:
                logging.error(f"Error scraping {source}: {e}")
        
        return articles

class EntityExtractor:
    """
    BRAIN 1: The Omniscient Observer (Part B)
    Identifying WHO and WHAT the news is about.
    """
    def __init__(self):
        try:
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
    print("--- BRAIN 1: INITIALIZATION ---")
    
    scraper = NewsScraper()
    raw_news = scraper.fetch_articles()
    
    test_batch = raw_news[:3]
    
    extractor = EntityExtractor()
    
    print(f"\n[Analzying {len(test_batch)} Articles]")
    
    for article in test_batch:
        print(f"\n📰 Headline: {article['title']}")
        ents = extractor.extract_entities(article['title'])
        print(f"   ➤ Entities Detected: {ents}")
