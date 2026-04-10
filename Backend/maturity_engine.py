import json
import logging
from typing import Dict, List
from datetime import datetime
import google.generativeai as genai
import os

# Configure model from env
model_name = os.getenv('DEFAULT_MODEL', 'gemma-4-31b-it')
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel(model_name)

class MaturityEngine:
    """
    The "Market Cycle Detector"
    Determines if a story has reached "Actionable Intelligence" status.
    
    Philosophy: Maturity is NOT about counting events.
    It's about "Is this story ready to bet on?"
    """
    
    def assess_maturity(self, story: Dict) -> Dict:
        """
        Analyzes story timeline and determines market cycle phase.
        
        Returns:
        {
            "maturity_level": "NASCENT" | "DEVELOPING" | "MATURE" | "ACTIONABLE",
            "confidence_score": 0.0-1.0,
            "market_cycle_phase": "Rumor" | "Confirmation" | "Peak Hype" | "Correction",
            "investment_recommendation": {
                "action": "WAIT" | "SMALL_POSITION" | "FULL_ALLOCATION",
                "capital_allocation_pct": 8.5,
                "optimal_timing": "Now - before retail catches on",
                "reasoning": "..."
            }
        }
        """
        events = story.get('events', [])
        
        # Not enough data yet
        if len(events) < 2:
            return self._nascent_story()
        
        # Build narrative timeline for AI
        narrative = self._build_narrative(story)
        
        # Ask Gemini to assess market cycle
        try:
            prompt = f"""
You are a Market Cycle Analyst specializing in identifying optimal entry/exit points.

STORY: {story['main_topic']}

TIMELINE:
{narrative}

PATTERN HISTORY: {json.dumps(story.get('pattern_history', []))}

TASK:
Determine the MARKET CYCLE PHASE of this story:

1. **RUMOR PHASE**: Unconfirmed speculation, low signal, insider whispers
2. **CONFIRMATION PHASE**: Official announcements, thesis validated, smart money enters
3. **PEAK HYPE PHASE**: Mainstream coverage, retail FOMO, top is near
4. **CORRECTION PHASE**: Reality check, pullback begins, weak hands exit

Also assess:
- Is there enough DATA to make a confident prediction? (Yes/No + reasoning)
- What is the OPTIMAL ENTRY TIMING? (Now / Wait 24-48hrs / Wait for dip / Too late)
- What % of capital should be allocated? (0-15%, be conservative)
- What is the EXIT STRATEGY? (Take profit target, time horizon)

Return ONLY valid JSON (no markdown):
{{
    "market_cycle_phase": "Confirmation Phase",
    "maturity_level": "ACTIONABLE",
    "confidence_score": 0.85,
    "data_sufficiency": "Yes - 5 events over 72 hours with consistent Bullish pattern",
    "optimal_timing": "Now - Confirmation just received, before retail catches on",
    "capital_allocation_pct": 8.5,
    "exit_strategy": "Take profit at +25% or hold for 3 months",
    "reasoning": "Story moved from Rumor to Confirmation. Pattern is Capital Injection (95% confidence). Sentiment flipped Bullish. This is the sweet spot before peak hype."
}}
"""
            
            safety = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            response = model.generate_content(prompt, safety_settings=safety)
            raw_text = response.text
            
            import re
            try:
                # Robust extraction
                json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    result = json.loads(raw_text.replace('```json', '').replace('```', '').strip())
            except Exception as jse:
                logging.error(f"Maturity JSON Parse Error: {jse}. Raw: {raw_text[:200]}")
                raise jse
            
            return self._format_recommendation(result, story)
        
        except Exception as e:
            logging.error(f"Maturity assessment failed: {e}")
            return self._fallback_assessment(story)
    
    def _build_narrative(self, story: Dict) -> str:
        """Constructs a timeline narrative for the AI"""
        events = story['events']
        narrative = ""
        
        for i, event in enumerate(events):
            date_str = event['date'][:10] if 'date' in event else 'Unknown'
            sentiment_label = event.get('sentiment', {}).get('sentiment_label', 'Unknown')
            pattern = event.get('pattern', 'None')
            
            narrative += f"Event {i+1} ({date_str}):\n"
            narrative += f"  Title: {event.get('title', 'N/A')}\n"
            narrative += f"  Sentiment: {sentiment_label}\n"
            narrative += f"  Pattern: {pattern}\n\n"
        
        return narrative
    
    def _format_recommendation(self, ai_result: Dict, story: Dict) -> Dict:
        """Converts AI output to actionable format"""
        maturity_level = ai_result.get('maturity_level', 'DEVELOPING')
        confidence = ai_result.get('confidence_score', 0.5)
        
        # Map to investment action
        if maturity_level == 'ACTIONABLE' and confidence > 0.75:
            action = 'FULL_ALLOCATION'
        elif maturity_level in ['MATURE', 'ACTIONABLE'] and confidence > 0.5:
            action = 'SMALL_POSITION'
        else:
            action = 'WAIT'
        
        return {
            "maturity_level": maturity_level,
            "confidence_score": confidence,
            "market_cycle_phase": ai_result.get('market_cycle_phase', 'Unknown'),
            "data_sufficiency": ai_result.get('data_sufficiency', 'Unknown'),
            "investment_recommendation": {
                "action": action,
                "capital_allocation_pct": ai_result.get('capital_allocation_pct', 0),
                "optimal_timing": ai_result.get('optimal_timing', 'Wait for more data'),
                "exit_strategy": ai_result.get('exit_strategy', 'TBD'),
                "reasoning": ai_result.get('reasoning', '')
            }
        }
    
    def _nascent_story(self) -> Dict:
        """Returns assessment for brand new stories"""
        return {
            "maturity_level": "NASCENT",
            "confidence_score": 0.0,
            "market_cycle_phase": "Rumor Phase",
            "data_sufficiency": "No - Only 1 event detected",
            "investment_recommendation": {
                "action": "WAIT",
                "capital_allocation_pct": 0,
                "optimal_timing": "Wait for confirmation",
                "exit_strategy": "N/A",
                "reasoning": "Insufficient data. Need at least 2 events to assess market cycle."
            }
        }
    
    def _fallback_assessment(self, story: Dict) -> Dict:
        """Fallback if AI fails"""
        events = story.get('events', [])
        
        return {
            "maturity_level": "DEVELOPING",
            "confidence_score": 0.3,
            "market_cycle_phase": "Unknown",
            "data_sufficiency": f"Partial - {len(events)} events tracked",
            "investment_recommendation": {
                "action": "WAIT",
                "capital_allocation_pct": 0,
                "optimal_timing": "Wait for AI analysis to succeed",
                "exit_strategy": "N/A",
                "reasoning": "AI assessment failed. Manual review recommended."
            }
        }

if __name__ == "__main__":
    print("--- MATURITY ENGINE TEST ---")
    
    # Mock story for testing
    test_story = {
        "main_topic": "Tesla raises $5B in new funding",
        "events": [
            {
                "date": "2024-01-01T10:00:00",
                "title": "Rumor: Tesla in talks with investors",
                "sentiment": {"sentiment_label": "Neutral"},
                "pattern": "None"
            },
            {
                "date": "2024-01-02T14:00:00",
                "title": "Confirmed: Tesla announces $5B Series D",
                "sentiment": {"sentiment_label": "Bullish"},
                "pattern": "Capital Injection"
            },
            {
                "date": "2024-01-03T09:00:00",
                "title": "Analysts upgrade Tesla price target",
                "sentiment": {"sentiment_label": "Bullish"},
                "pattern": "Capital Injection"
            }
        ],
        "pattern_history": [
            {"pattern": "Capital Injection", "score": 0.95}
        ]
    }
    
    engine = MaturityEngine()
    assessment = engine.assess_maturity(test_story)
    
    print(json.dumps(assessment, indent=2))
