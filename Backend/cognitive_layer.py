import json
import logging
from typing import Dict, List, Any
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-3-flash-preview')

class CognitiveLayer:
    """
    The "Human Reasoning" Layer
    
    Philosophy: Don't just process news - THINK about it.
    Ask: "So what? Who wins? Who loses? What's next?"
    """
    
    def reason_about_news(self, article: Dict, entities: Dict, analysis: Dict) -> Dict:
        """
        The "So What?" Engine
        
        Transforms raw news into human-like insights:
        - Why does this matter?
        - Who benefits? Who suffers?
        - What's being hidden?
        - What happens next?
        - REAL-WORLD opportunities (commodities, real estate, consumer goods, etc.)
        """
        try:
            prompt = f"""
You are a veteran investor with 30 years of Wall Street experience. You've seen every market cycle, every bubble, every crash.

NEWS HEADLINE: {article['title']}

            FULL ARTICLE TEXT:
            {(article.get('content') or article.get('title','N/A'))[:3000]}

ENTITIES DETECTED: {json.dumps(entities)}

INITIAL ANALYSIS:
- Sentiment: {analysis['analysis']['sentiment'].get('sentiment_label', 'Unknown')}
- Pattern: {analysis['analysis']['matched_patterns'][0]['pattern_name'] if analysis['analysis']['matched_patterns'] else 'None'}

TASK: Think like a human. Answer these questions with SPECIFIC reasoning:

1. **SO WHAT?** 
   Why does this matter to markets? What's the real significance beyond the headline?

2. **WHO WINS?** 
   Which specific companies/sectors benefit? Explain the mechanism (not just "AI stocks go up").

3. **WHO LOSES?** 
   Which companies/sectors suffer? Be specific.

4. **WHAT'S UNSAID?** 
   Read between the lines. What is the article NOT telling us? What are they hiding?

5. **WHAT HAPPENS NEXT?** 
   Predict the next 3 moves in this chess game. Be specific with timeframes.

6. **CONVICTION LEVEL** 
   On a scale of 1-10, how confident are you this is actionable intelligence?

7. **CONTRARIAN CHECK**
   Is the market likely to overreact or underreact to this news? Why?

8. **REAL-WORLD OPPORTUNITIES** (NEW - CRITICAL)
   Beyond stock trading, how can a NORMAL PERSON profit or save money from this news?
   
   Consider:
   - **COMMODITY PLAY**: Will any physical goods (coffee, oil, metals, food) become scarce or cheap? Should people buy/sell NOW?
   - **REAL ESTATE**: Will property values change in specific areas? (infrastructure, zoning, company HQ moves)
   - **CONSUMER TIMING**: Should people buy electronics, cars, appliances NOW before price changes?
   - **SUPPLY CHAIN**: Will shortages occur? Should people stock up on essentials?
   - **REGULATORY**: Are laws changing that affect product availability? (bans, tariffs, taxes)
   - **CURRENCY**: Should people convert money to other currencies or assets?
   - **ENERGY**: Will gas/electricity prices change? Should people fill tanks or lock in rates?
   
   For EACH real-world opportunity, provide:
   - Type (COMMODITY, REAL_ESTATE, CONSUMER_GOODS, etc.)
   - Specific item/action
   - Timing (URGENT 24-48hrs, WEEKS, MONTHS)
   - Investment amount
   - Expected savings/profit
   - Reasoning

Return ONLY valid JSON (no markdown):
{{
    "so_what": "This signals a fundamental shift in... because...",
    "winners": [
        {{"entity": "Company A", "reason": "They benefit because...", "expected_impact": "+15-20%"}},
        {{"entity": "Sector B", "reason": "This creates demand for...", "expected_impact": "+10-15%"}}
    ],
    "losers": [
        {{"entity": "Company C", "reason": "They lose because...", "expected_impact": "-10-15%"}},
        {{"entity": "Sector D", "reason": "This obsoletes their...", "expected_impact": "-20-30%"}}
    ],
    "unsaid": "The article conveniently omits that... This suggests...",
    "next_moves": [
        {{"move": "Action 1", "timeframe": "Within 24-48 hours", "probability": 0.8}},
        {{"move": "Action 2", "timeframe": "Within 1 week", "probability": 0.6}},
        {{"move": "Action 3", "timeframe": "Within 1 month", "probability": 0.4}}
    ],
    "conviction": 8,
    "contrarian_angle": "Market will likely overreact because... The smart play is...",
    "real_world_opportunities": [
        {{
            "type": "COMMODITY",
            "item": "Coffee beans",
            "action": "Buy 6 months supply at Costco NOW",
            "timing": "URGENT",
            "investment": "$200",
            "expected_savings": "$400",
            "reasoning": "Drought will cause 50% price spike in 2 weeks before mainstream panic buying"
        }},
        {{
            "type": "CONSUMER_GOODS",
            "item": "Laptops",
            "action": "Buy laptop/phone NOW before tariff",
            "timing": "WEEKS",
            "investment": "$1500",
            "expected_savings": "$450",
            "reasoning": "25% tariff will increase electronics prices by 20-30% in 30 days"
        }}
    ]
}}
"""
            
            response = model.generate_content(prompt)
            cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
            if not cleaned_text:
                logging.error('Empty response from Gemini for cognitive reasoning')
                raise ValueError('Empty response from model')
            try:
                result = json.loads(cleaned_text)
            except Exception:
                import re
                m = re.search(r'\{[\s\S]*\}', cleaned_text)
                if m:
                    try:
                        result = json.loads(m.group(0))
                    except Exception as e:
                        logging.error(f'Failed to parse extracted JSON from cognitive layer: {e} -- raw: {cleaned_text[:200]}')
                        raise
                else:
                    logging.error(f'Unable to parse cognitive response as JSON: {cleaned_text[:200]}')
                    raise
            logging.info(f"Cognitive reasoning complete. Conviction: {result.get('conviction', 0)}/10")
            
            # Log real-world opportunities
            real_world = result.get('real_world_opportunities', [])
            if real_world:
                logging.warning(f"🌍 {len(real_world)} REAL-WORLD OPPORTUNITIES DETECTED")
                for opp in real_world:
                    logging.warning(f"   {opp['type']}: {opp['item']} - {opp['action']}")
            
            return result
        
        except Exception as e:
            logging.error(f"Cognitive reasoning failed: {e}")
            return self._fallback_reasoning()
    
    def detect_opportunity_type(self, cognitive_reasoning: Dict, story: Dict) -> Dict:
        """
        Identifies if this is a high-value asymmetric opportunity
        """
        try:
            prompt = f"""
You are a hedge fund manager looking for 10x opportunities.

COGNITIVE ANALYSIS:
{json.dumps(cognitive_reasoning, indent=2)}

STORY CONTEXT:
- Topic: {story.get('main_topic', 'Unknown')}
- Events Count: {len(story.get('events', []))}
- Conviction: {cognitive_reasoning.get('conviction', 0)}/10

TASK: Is this a HIGH-VALUE OPPORTUNITY?

Criteria:
1. **Information Asymmetry**: Do we know something the market doesn't yet?
2. **Timing Edge**: Are we early? (Before mainstream coverage)
3. **Conviction**: Is the thesis backed by multiple independent sources?
4. **Catalyst**: Is there a specific event that will trigger price movement?
5. **Risk/Reward**: Is the upside 3x+ the downside?

Return ONLY valid JSON:
{{
    "is_opportunity": true/false,
    "opportunity_type": "ASYMMETRIC_INFO" | "EARLY_MOVER" | "CATALYST_PLAY" | "CONTRARIAN_PLAY" | "NONE",
    "expected_return": "25-50%",
    "time_horizon": "3-6 months",
    "key_catalyst": "Specific event that will trigger movement",
    "risk_reward_ratio": 3.5,
    "reasoning": "Detailed explanation of why this is a rare opportunity"
}}
"""
            
            response = model.generate_content(prompt)
            cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
            if not cleaned_text:
                logging.error('Empty response from Gemini for opportunity detection')
                raise ValueError('Empty response from model')
            try:
                result = json.loads(cleaned_text)
            except Exception:
                import re
                m = re.search(r'\{[\s\S]*\}', cleaned_text)
                if m:
                    try:
                        result = json.loads(m.group(0))
                    except Exception as e:
                        logging.error(f'Failed to parse extracted JSON from opportunity detection: {e} -- raw: {cleaned_text[:200]}')
                        raise
                else:
                    logging.error(f'Unable to parse opportunity detection response as JSON: {cleaned_text[:200]}')
                    raise
            if result.get('is_opportunity'):
                logging.warning(f"🎯 HIGH-VALUE OPPORTUNITY DETECTED: {result['opportunity_type']}")
            return result
        
        except Exception as e:
            logging.error(f"Opportunity detection failed: {e}")
            return {"is_opportunity": False, "opportunity_type": "NONE"}
    
    def update_thesis(self, story: Dict, new_event: Dict, cognitive_reasoning: Dict) -> Dict:
        """
        Updates the living thesis based on new evidence
        
        A thesis is a BELIEF that evolves with evidence.
        """
        current_thesis = story.get('thesis', {
            "core_belief": "",
            "supporting_evidence": [],
            "contradicting_evidence": [],
            "conviction_score": 0.5,
            "thesis_status": "FORMING"
        })
        
        try:
            prompt = f"""
You are updating an investment thesis based on new evidence.

CURRENT THESIS:
- Core Belief: {current_thesis.get('core_belief', 'Not yet formed')}
- Conviction: {current_thesis.get('conviction_score', 0.5):.0%}
- Status: {current_thesis.get('thesis_status', 'FORMING')}

SUPPORTING EVIDENCE SO FAR:
{json.dumps(current_thesis.get('supporting_evidence', []), indent=2)}

CONTRADICTING EVIDENCE SO FAR:
{json.dumps(current_thesis.get('contradicting_evidence', []), indent=2)}

NEW EVENT:
- Title: {new_event.get('title', 'Unknown')}
- Cognitive Reasoning: {cognitive_reasoning.get('so_what', 'N/A')}
- Conviction: {cognitive_reasoning.get('conviction', 0)}/10

TASK: Update the thesis

1. Does this event SUPPORT, CONTRADICT, or is NEUTRAL to the thesis?
2. Should we UPDATE the core belief?
3. What is the new conviction score (0-1)?
4. What is the thesis status? (FORMING | STRENGTHENING | WEAKENING | VALIDATED | BROKEN)

Return ONLY valid JSON:
{{
    "relationship": "SUPPORTS" | "CONTRADICTS" | "NEUTRAL",
    "updated_core_belief": "Clear, specific statement of what we believe",
    "conviction_delta": 0.1,
    "new_conviction_score": 0.85,
    "thesis_status": "STRENGTHENING",
    "reasoning": "This event strengthens the thesis because..."
}}
"""
            
            response = model.generate_content(prompt)
            cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
            if not cleaned_text:
                logging.error('Empty response from Gemini for thesis update')
                raise ValueError('Empty response from model')
            try:
                result = json.loads(cleaned_text)
            except Exception:
                import re
                m = re.search(r'\{[\s\S]*\}', cleaned_text)
                if m:
                    try:
                        result = json.loads(m.group(0))
                    except Exception as e:
                        logging.error(f'Failed to parse extracted JSON from thesis update: {e} -- raw: {cleaned_text[:200]}')
                        raise
                else:
                    logging.error(f'Unable to parse thesis update response as JSON: {cleaned_text[:200]}')
                    raise
            
            # Update thesis
            updated_thesis = {
                "core_belief": result['updated_core_belief'],
                "conviction_score": result['new_conviction_score'],
                "thesis_status": result['thesis_status'],
                "supporting_evidence": current_thesis.get('supporting_evidence', []),
                "contradicting_evidence": current_thesis.get('contradicting_evidence', [])
            }
            
            # Add to appropriate evidence list
            evidence_entry = {
                "date": new_event.get('date', ''),
                "title": new_event.get('title', ''),
                "reasoning": cognitive_reasoning.get('so_what', '')
            }
            
            if result['relationship'] == 'SUPPORTS':
                updated_thesis['supporting_evidence'].append(evidence_entry)
            elif result['relationship'] == 'CONTRADICTS':
                updated_thesis['contradicting_evidence'].append(evidence_entry)
            
            logging.info(f"Thesis updated: {result['thesis_status']} (Conviction: {result['new_conviction_score']:.0%})")
            return updated_thesis
        
        except Exception as e:
            logging.error(f"Thesis update failed: {e}")
            return current_thesis
    
    def _fallback_reasoning(self) -> Dict:
        """Fallback if AI fails"""
        return {
            "so_what": "Unable to determine significance",
            "winners": [],
            "losers": [],
            "unsaid": "AI reasoning failed",
            "next_moves": [],
            "conviction": 0,
            "contrarian_angle": "N/A",
            "real_world_opportunities": []  # NEW
        }

if __name__ == "__main__":
    print("--- COGNITIVE LAYER TEST ---")
    
    # Mock article
    test_article = {
        "title": "OpenAI announces GPT-5 with advanced reasoning",
        "content": "OpenAI today unveiled GPT-5, featuring breakthrough reasoning capabilities that surpass GPT-4 by 10x on complex tasks..."
    }
    
    test_entities = {
        "ORG": ["OpenAI", "Microsoft"],
        "PRODUCT": ["GPT-5", "GPT-4"]
    }
    
    test_analysis = {
        "analysis": {
            "sentiment": {"sentiment_label": "Bullish"},
            "matched_patterns": [{"pattern_name": "Product Launch"}]
        }
    }
    
    cognitive = CognitiveLayer()
    reasoning = cognitive.reason_about_news(test_article, test_entities, test_analysis)
    
    print(json.dumps(reasoning, indent=2))
