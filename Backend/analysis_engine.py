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
        # Dynamic Mode on: No hardcoded patterns.
        pass

    def analyze_news(self, article: Dict[str, Any], entities: Dict[str, List[str]]) -> Dict[str, Any]:
        """
        Orchestrates the analysis: Sentiment -> Patterns -> Second Order Effects
        Now uses full article content if available.
        """
        # Use full content if available and non-empty, otherwise fall back to title
        text_to_analyze = article.get('content') or article.get('title', '')
        
        logging.info(f"Analyzing article: {article.get('title')} ({len(text_to_analyze)} chars)")
        
        sentiment_data = self._get_deep_analysis(text_to_analyze)
        
        patterns = self._match_patterns(text_to_analyze, entities)
        
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
            if not cleaned_text:
                logging.error('Empty response from Gemini for deep analysis')
                raise ValueError('Empty response from model')
            try:
                return json.loads(cleaned_text)
            except Exception:
                # Try to recover JSON embedded in text
                import re
                m = re.search(r'\{[\s\S]*\}', cleaned_text)
                if m:
                    try:
                        return json.loads(m.group(0))
                    except Exception as e:
                        logging.error(f'Failed to parse extracted JSON from Gemini deep analysis: {e} -- raw: {cleaned_text[:200]}')
                        raise
                logging.error(f'Unable to parse Gemini deep analysis response as JSON: {cleaned_text[:200]}')
                raise
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
        BRAIN 3: The Temporal Prophet (Dynamic AI Version).
        Asks Gemini: 'What historical event corresponds to this?'
        """
        try:
            prompt = f"""
            You are a Financial Historian. Analyze this news: "{text}"
            
            TASK:
            1. Identify the core economic pattern (e.g., "Supply Shock", "Regulatory Crackdown", "Merger Arbitrage").
            2. Search your training data for the BEST historical parallel (e.g., "Similar to the 2008 Housing Crisis" or "Like the Dotcom Bubble").
            3. Predict the typical outcome based on history.
            
            Return ONLY a raw JSON list of objects (max 1 best match):
            [
                {{
                    "pattern_name": "Name of the Pattern",
                    "historical_outcome": "What usually happens next?",
                    "example": "Specific Historical Event (Year)",
                    "score": 0.95
                }}
            ]
            """
            response = model.generate_content(prompt)
            cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
            if not cleaned_text:
                logging.error('Empty response from Gemini for pattern matching')
                raise ValueError('Empty response from model')
            try:
                return json.loads(cleaned_text)
            except Exception:
                import re
                m = re.search(r'\[[\s\S]*\]', cleaned_text)
                if m:
                    try:
                        return json.loads(m.group(0))
                    except Exception as e:
                        logging.error(f'Failed to parse extracted JSON array from Gemini pattern match: {e} -- raw: {cleaned_text[:200]}')
                        raise
                logging.error(f'Unable to parse Gemini pattern matching response as JSON: {cleaned_text[:200]}')
                raise
        except Exception as e:
            logging.error(f"Pattern Matching Failed: {e}")
            # Fallback to a generic pattern if AI fails
            return [{
                "pattern_name": "Unprecedented Event", 
                "historical_outcome": "Volatility expected as market digests data.", 
                "example": "None detected",
                "score": 0.0
            }]

    def _derive_second_order(self, entities: Dict[str, List[str]]) -> List[str]:
        """
        Layer 3: Inferring indirect impacts (AI Version).
        """
        # We can also make this dynamic if needed, but for now, let's keep it simple or upgrade it 
        # to use the entities explicitly in the prompt above.
        # But per the plan, let's inject creativity here too.
        
        prompt = f"""
        Given these entities involved in a major news event: {json.dumps(entities)}
        
        List 3 "Second-Order Effects" (Ripple effects on other industries/sectors).
        Return purely a JSON list of strings. Example: ["Copper Miners (due to EV demand)", "Logistics firms"]
        """
        try:
            response = model.generate_content(prompt)
            cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
            if not cleaned_text:
                logging.error('Empty response from Gemini for second-order derivation')
                raise ValueError('Empty response from model')
            try:
                return json.loads(cleaned_text)
            except Exception:
                import re
                m = re.search(r'\[[\s\S]*\]', cleaned_text)
                if m:
                    try:
                        return json.loads(m.group(0))
                    except Exception as e:
                        logging.error(f'Failed to parse extracted JSON list from Gemini second-order: {e} -- raw: {cleaned_text[:200]}')
                        raise
                logging.error(f'Unable to parse Gemini second-order response as JSON: {cleaned_text[:200]}')
                raise
        except:
             return ["Market Volatility", "Sector Rotation"]

if __name__ == "__main__":
    print("--- BRAIN 3: INITIALIZATION (Generative Mode) ---")
    
    engine = AnalysisEngine()
    
    dummy_article = {'title': 'Nvidia reveals new Blackwell AI chip, warning of supply constraints'}
    dummy_entities = {'ORG': ['Nvidia'], 'PRODUCT': ['Blackwell AI chip']}
    
    result = engine.analyze_news(dummy_article, dummy_entities)
    
    print("\n[Analysis Result]")
    print(json.dumps(result, indent=2))
