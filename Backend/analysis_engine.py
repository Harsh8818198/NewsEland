import google.generativeai as genai
import json
import logging
import os
from typing import Dict, List, Any

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

import os
from dotenv import load_dotenv

load_dotenv(override=True)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

class AnalysisEngine:
    """
    BRAIN 3: The Temporal Prophet & Layer 3 Analysis
    """
    def __init__(self):
        self.historical_patterns = [
            {
                "trigger_keywords": ["regulation", "antitrust", "ban", "fine"],
                "sector": "Tech",
                "pattern_name": "Regulatory Headwind",
                "historical_outcome": "Sector typically dips 5-8% short term.",
                "example": "GDPR (2018), China Tech Crackdown (2021)"
            },
            {
                "trigger_keywords": ["shortage", "supply chain", "capacity", "supply"],
                "sector": "Semiconductors",
                "pattern_name": "Supply Crunch",
                "historical_outcome": "Pricing power increases, margins expand for suppliers.",
                "example": "Chip Shortage (2020), RAM Price Spike (2013)"
            },
            {
                "trigger_keywords": ["funding", "raise", "series b", "series c"],
                "sector": "Startup",
                "pattern_name": "Capital Injection",
                "historical_outcome": "Talent war intensifies, ad spend increases on platforms.",
                "example": "OpenAI Investment (2023), Uber/Lyft Wars (2015)"
            }
        ]

    def analyze_news(self, article: Dict[str, Any], entities: Dict[str, List[str]]) -> Dict[str, Any]:
        """
        Orchestrates the analysis: Sentiment -> Patterns -> Second Order Effects
        """
        logging.info(f"Analyzing article: {article.get('title')}")
        
        sentiment_data = self._get_deep_analysis(article['title'])
        
        patterns = self._match_patterns(article['title'], entities)
        
        second_order = self._derive_second_order(entities)
        
        return {
            "article": article,
            "entities": entities,
            "analysis": {
                "sentiment": sentiment_data,
                "matched_patterns": patterns,
                "second_order_effects": second_order
            }
        }

    def _get_deep_analysis(self, text: str) -> Dict[str, Any]:
        """
        BRAIN 3: Uses Gemini to generate "Deep Insights" (Why, What, How).
        """
        try:
            prompt = f"""
            Act as an elite Financial Intelligence Analyst. Analyze this news headline/snippet: "{text}"
            
            Return ONLY a JSON object with the following keys:
            - "sentiment_score": float (-1.0 to 1.0)
            - "sentiment_label": string (Bullish/Bearish/Neutral)
            - "key_event_type": string (e.g., Earnings, M&A, Regulation)
            - "why": string (The root cause/driver of this event)
            - "what": string (The core event summary)
            - "how": string (The mechanism of impact on the company/sector)
            - "expected_impact": string (Short-term prediction, less than 1 month)
            """
            response = model.generate_content(prompt)
            cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(cleaned_text)
        except Exception as e:
            logging.error(f"Gemini Analysis Failed: {e}")
            return {
                "sentiment_score": 0, 
                "sentiment_label": "Unknown", 
                "why": "Analysis failed",
                "what": "Unknown",
                "how": "Unknown",
                "error": str(e)
            }

    def _match_patterns(self, text: str, entities: Dict[str, List[str]]) -> List[Dict]:
        """
        BRAIN 3: The Temporal Prophet - Matching current news to history.
        """
        matches = []
        text_lower = text.lower()
        
        for pattern in self.historical_patterns:
            if any(k in text_lower for k in pattern['trigger_keywords']):
                matches.append(pattern)
        
        return matches

    def _derive_second_order(self, entities: Dict[str, List[str]]) -> List[str]:
        """
        Layer 3: Inferring indirect impacts.
        """
        effects = []
        for org in entities.get('ORG', []):
            if "Nvidia" in org or "Intel" in org or "AMD" in org:
                effects.append("Data Center Power Consumption (Utilities)")
                effects.append("Advanced Packaging (TSMC/Amkor)")
            if "Tesla" in org or "BYD" in org:
                effects.append("Lithium/Cobalt Miners")
                effects.append("Charging Infrastructure")
                
        if not effects:
            effects.append("No specific second-order effects inferred for these entities.")
            
        return list(set(effects)) # Deduplicate

if __name__ == "__main__":
    print("--- BRAIN 3: INITIALIZATION ---")
    
    engine = AnalysisEngine()
    
    dummy_article = {'title': 'Nvidia reveals new Blackwell AI chip, warning of supply constraints'}
    dummy_entities = {'ORG': ['Nvidia'], 'PRODUCT': ['Blackwell AI chip']}
    
    result = engine.analyze_news(dummy_article, dummy_entities)
    
    print("\n[Analysis Result]")
    print(json.dumps(result, indent=2))
