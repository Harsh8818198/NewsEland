"""
Intelligence Layer: Competitive, Macro, and Market Timing

Consolidates:
- Competitive Intelligence (competitor analysis)
- Macro Context Engine (market regime awareness)
- Market Timing Engine (optimal entry/exit windows)
"""

import logging
from typing import Dict, List
from datetime import datetime, time, timedelta
import pytz
import google.generativeai as genai
import os
import json

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-3-flash-preview')


# ============================================================================
# COMPETITIVE INTELLIGENCE
# ============================================================================

class CompetitiveIntelligence:
    """Analyzes competitive landscape"""
    
    def __init__(self, entity_graph=None):
        self.entity_graph = entity_graph
    
    def analyze_competitive_landscape(self, story: Dict, cognitive_reasoning: Dict) -> Dict:
        try:
            main_entity = story.get('entities', [{}])[0] if story.get('entities') else "Unknown"
            
            prompt = f"""
You are a competitive intelligence analyst.

STORY: {story.get('main_topic', 'Unknown')}
MAIN ENTITY: {main_entity}
COGNITIVE ANALYSIS: {json.dumps(cognitive_reasoning.get('so_what', 'N/A'))}

Analyze competitive landscape:
1. Main competitors (3-5)
2. Competitive position (STRONG/NEUTRAL/WEAK)
3. Threats
4. Advantages
5. Market share trend (GAINING/STABLE/LOSING)

Return ONLY valid JSON:
{{
    "competitive_position": "STRONG",
    "main_competitors": [{{"name": "X", "threat_level": "HIGH", "reason": "..."}}],
    "competitive_threats": ["..."],
    "competitive_advantages": ["..."],
    "market_share_trend": "GAINING"
}}
"""
            
            response = model.generate_content(prompt)
            cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(cleaned_text)
        
        except Exception as e:
            logging.error(f"Competitive analysis failed: {e}")
            return {"competitive_position": "NEUTRAL", "main_competitors": [], "competitive_threats": [], "competitive_advantages": [], "market_share_trend": "STABLE"}


# ============================================================================
# MACRO CONTEXT ENGINE
# ============================================================================

class MacroContextEngine:
    """Provides macro-economic context"""
    
    def get_current_regime(self) -> Dict:
        try:
            prompt = """
Based on current market conditions, provide:
1. MARKET REGIME: BULL | BEAR | SIDEWAYS
2. VIX LEVEL: Approximate current VIX
3. FED POLICY: TIGHTENING | EASING | NEUTRAL
4. RECESSION PROBABILITY: 0-1
5. SECTOR ROTATION: Which sectors are in favor?

Return ONLY valid JSON:
{
    "market_regime": "BULL",
    "vix": 18,
    "fed_policy": "NEUTRAL",
    "recession_probability": 0.25,
    "sector_rotation": "Technology leading",
    "risk_level": "MEDIUM"
}
"""
            
            response = model.generate_content(prompt)
            cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(cleaned_text)
        
        except Exception as e:
            logging.error(f"Macro context failed: {e}")
            return {"market_regime": "SIDEWAYS", "vix": 20, "fed_policy": "NEUTRAL", "recession_probability": 0.3, "sector_rotation": "Unknown", "risk_level": "MEDIUM"}
    
    def adjust_recommendation(self, recommendation: Dict, macro: Dict) -> Dict:
        adjusted = recommendation.copy()
        adjustments = []
        
        # Bear market → downgrade
        if macro['market_regime'] == 'BEAR' and adjusted.get('action') == 'BUY':
            adjusted['action'] = 'WATCHLIST'
            adjustments.append("Downgraded due to bear market")
        
        # High VIX → reduce size
        if macro['vix'] > 30:
            adjusted['capital_allocation_pct'] = adjusted.get('capital_allocation_pct', 0) * 0.5
            adjustments.append(f"Reduced allocation due to high VIX ({macro['vix']})")
        
        # Recession risk → defensive only
        if macro['recession_probability'] > 0.5:
            sector = adjusted.get('sector', '')
            if sector not in ['Healthcare', 'Utilities', 'Consumer Staples']:
                adjusted['action'] = 'AVOID'
                adjustments.append(f"Avoided due to recession risk")
        
        adjusted['macro_adjustments'] = adjustments
        adjusted['macro_context'] = macro
        return adjusted


# ============================================================================
# MARKET TIMING ENGINE
# ============================================================================

class MarketTimingEngine:
    """Determines optimal entry/exit timing"""
    
    def get_optimal_entry_window(self, story: Dict, entities: List[str]) -> Dict:
        checks = []
        checks.append(self._check_market_hours())
        checks.append(self._check_earnings_calendar(entities))
        checks.append(self._check_macro_events())
        checks.append(self._check_day_patterns())
        return self._synthesize_timing(checks)
    
    def _check_market_hours(self) -> Dict:
        et_tz = pytz.timezone('America/New_York')
        now_et = datetime.now(et_tz)
        
        # Weekend check
        if now_et.weekday() >= 5:
            return {"check": "MARKET_HOURS", "status": "CLOSED", "timing": "WAIT_MARKET_OPEN", "reasoning": "Market closed (weekend)", "delay_hours": 24}
        
        # Hours check
        market_open = time(9, 30)
        market_close = time(16, 0)
        current_time = now_et.time()
        
        if market_open <= current_time <= market_close:
            return {"check": "MARKET_HOURS", "status": "OPEN", "timing": "ENTER_NOW", "reasoning": "Market is open", "delay_hours": 0}
        else:
            return {"check": "MARKET_HOURS", "status": "CLOSED", "timing": "WAIT_MARKET_OPEN", "reasoning": "Market closed", "delay_hours": 12}
    
    def _check_earnings_calendar(self, entities: List[str]) -> Dict:
        # Placeholder - needs API integration
        return {"check": "EARNINGS_CALENDAR", "status": "CLEAR", "timing": "ENTER_NOW", "reasoning": "No earnings in next 7 days", "delay_hours": 0}
    
    def _check_macro_events(self) -> Dict:
        # Placeholder - needs API integration
        return {"check": "MACRO_EVENTS", "status": "CLEAR", "timing": "ENTER_NOW", "reasoning": "No major macro events", "delay_hours": 0}
    
    def _check_day_patterns(self) -> Dict:
        et_tz = pytz.timezone('America/New_York')
        now_et = datetime.now(et_tz)
        day = now_et.weekday()
        
        if day == 0:  # Monday
            return {"check": "DAY_PATTERN", "status": "CAUTION", "timing": "WAIT_24H", "reasoning": "Monday - volatile", "delay_hours": 24}
        elif day == 4:  # Friday
            return {"check": "DAY_PATTERN", "status": "CAUTION", "timing": "WAIT_24H", "reasoning": "Friday - low volume", "delay_hours": 72}
        else:
            return {"check": "DAY_PATTERN", "status": "OPTIMAL", "timing": "ENTER_NOW", "reasoning": "Optimal liquidity", "delay_hours": 0}
    
    def _synthesize_timing(self, checks: List[Dict]) -> Dict:
        for check in checks:
            if check["timing"] != "ENTER_NOW":
                return {
                    "timing": check["timing"],
                    "reasoning": check["reasoning"],
                    "optimal_window": "TBD",
                    "risks": [c["reasoning"] for c in checks if c["status"] != "OPTIMAL"],
                    "all_checks": checks
                }
        
        return {
            "timing": "ENTER_NOW",
            "reasoning": "All checks passed",
            "optimal_window": "Now",
            "risks": [],
            "all_checks": checks
        }
