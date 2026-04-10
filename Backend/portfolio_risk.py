"""
Portfolio, Risk, and Exit Strategy Management

Consolidates:
- Portfolio Manager (position tracking, sector limits)
- Risk Engine (scenario analysis, Kelly Criterion)
- Exit Strategy Planner (tiered exits, trailing stops)
"""

import json
import logging
from typing import Dict, List
from datetime import datetime
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

# ============================================================================
# PORTFOLIO MANAGER
# ============================================================================

class PortfolioManager:
    """Tracks positions, sector exposure, validates allocations"""
    
    def __init__(self, user_profile, portfolio_file: str = None):
        self.user = user_profile
        # Persist portfolio in backend data directory
        self.portfolio_file = portfolio_file or os.path.join(DATA_DIR, "portfolio.json")
        self.positions = {}
        self.sector_exposure = {}
        self.cash_reserve = user_profile.capital_available
        self.total_deployed = 0.0
        self._load_portfolio()
    
    def _load_portfolio(self):
        try:
            with open(self.portfolio_file, 'r') as f:
                data = json.load(f)
                self.positions = data.get('positions', {})
                self.sector_exposure = data.get('sector_exposure', {})
                self.cash_reserve = data.get('cash_reserve', self.user.capital_available)
                self.total_deployed = data.get('total_deployed', 0.0)
        except:
            logging.info("No existing portfolio found")
    
    def _save_portfolio(self):
        data = {
            'positions': self.positions,
            'sector_exposure': self.sector_exposure,
            'cash_reserve': self.cash_reserve,
            'total_deployed': self.total_deployed,
            'last_updated': datetime.now().isoformat()
        }
        with open(self.portfolio_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def validate_allocation(self, recommendation: Dict) -> Dict:
        warnings = []
        allocation_pct = recommendation.get('capital_allocation_pct', 0) / 100
        allocation_amount = self.user.capital_available * allocation_pct
        sector = recommendation.get('sector', 'Unknown')
        ticker = recommendation.get('ticker', 'Unknown')
        
        # Check 1: Cash
        if allocation_amount > self.cash_reserve:
            return {"approved": False, "reason": f"Insufficient cash", "warnings": []}
        
        # Check 2: Sector concentration (30% max)
        new_sector_exposure = self.sector_exposure.get(sector, 0) + allocation_pct
        if new_sector_exposure > 0.30:
            return {"approved": False, "reason": f"Sector concentration: {new_sector_exposure:.0%}", "warnings": []}
        elif new_sector_exposure > 0.25:
            warnings.append(f"⚠️  {sector} approaching limit")
        
        # Check 3: Total deployment (80% max)
        new_total = self.total_deployed + allocation_pct
        if new_total > 0.80:
            return {"approved": False, "reason": f"Deployment limit: {new_total:.0%}", "warnings": []}
        
        # Check 4: Single position (15% max)
        if allocation_pct > 0.15:
            return {"approved": False, "reason": f"Position too large: {allocation_pct:.0%}", "warnings": []}
        
        return {"approved": True, "reason": "Approved", "warnings": warnings}
    
    def execute_trade(self, recommendation: Dict, entry_price: float, story_id: str = None):
        allocation_pct = recommendation.get('capital_allocation_pct', 0) / 100
        allocation_amount = self.user.capital_available * allocation_pct
        sector = recommendation.get('sector', 'Unknown')
        ticker = recommendation.get('ticker', 'Unknown')
        shares = allocation_amount / entry_price if entry_price > 0 else 0
        
        self.positions[ticker] = {
            "amount": allocation_amount,
            "shares": shares,
            "entry_price": entry_price,
            "entry_date": datetime.now().isoformat(),
            "sector": sector,
            "recommendation": recommendation,
            "story_id": story_id  # Link to story
        }
        
        self.sector_exposure[sector] = self.sector_exposure.get(sector, 0) + allocation_pct
        self.cash_reserve -= allocation_amount
        self.total_deployed += allocation_pct
        self._save_portfolio()
    
    def close_position(self, ticker: str, exit_price: float):
        if ticker not in self.positions:
            return None
        
        position = self.positions[ticker]
        entry_value = position['amount']
        exit_value = position['shares'] * exit_price
        pnl = exit_value - entry_value
        pnl_pct = (pnl / entry_value) if entry_value > 0 else 0
        
        sector = position['sector']
        allocation_pct = position['amount'] / self.user.capital_available
        
        self.sector_exposure[sector] = max(0, self.sector_exposure.get(sector, 0) - allocation_pct)
        self.cash_reserve += exit_value
        self.total_deployed -= allocation_pct
        del self.positions[ticker]
        self._save_portfolio()
        
        return {"pnl": pnl, "pnl_pct": pnl_pct}
    
    def get_portfolio_summary(self) -> Dict:
        """
        Return a portfolio summary compatible with both backend risk engines
        and frontend dashboard expectations.
        """
        # Transform internal positions dict into a list the frontend can display.
        position_list = []
        for ticker, position in self.positions.items():
            entry_price = position.get("entry_price", 0.0)
            shares = position.get("shares", 0.0)
            # In absence of live pricing, treat current price as entry price
            current_price = entry_price
            market_value = shares * current_price
            pnl = 0.0
            pnl_pct = 0.0

            position_list.append({
                "ticker": ticker,
                "sector": position.get("sector", "Unknown"),
                "shares": shares,
                "entry_price": entry_price,
                "current_price": current_price,
                "market_value": market_value,
                "pnl": pnl,
                "pnl_pct": pnl_pct,
                "story_id": position.get("story_id"),
            })

        total_value = self.cash_reserve + sum(p["market_value"] for p in position_list)
        total_pnl = sum(p["pnl"] for p in position_list)
        total_pnl_pct = (total_pnl / total_value) if total_value > 0 else 0.0

        return {
            # Original fields used by risk engine and other backend code
            "cash_reserve": self.cash_reserve,
            "total_deployed": self.total_deployed,
            "positions_count": len(self.positions),
            "sector_exposure": self.sector_exposure,
            "positions_raw": self.positions,
            # Frontend‑friendly fields for Dashboard & Portfolio pages
            "positions": position_list,
            "total_value": total_value,
            "total_pnl": total_pnl,
            "total_pnl_pct": total_pnl_pct,
            "cash": self.cash_reserve,
        }


# ============================================================================
# RISK ENGINE
# ============================================================================

class RiskEngine:
    """Scenario analysis, Kelly Criterion, stop-loss recommendations"""    
    def assess_risk(self, story: Dict, recommendation: Dict, portfolio_summary: Dict) -> Dict:
        # TFC V2.0: News-Aware Risk Assessment
        article_text = story.get('content') or story.get('main_topic', 'Unknown')
        thesis = story.get('thesis', {})
        conviction = thesis.get('conviction_score') or story.get('cognitive', {}).get('confidence', 0.5)
        
        allocation_pct = recommendation.get('capital_allocation_pct', 0) / 100
        
        scenarios = self._scenario_analysis(article_text, conviction)
        ev = self._calculate_expected_value(scenarios)
        risk_reward = self._calculate_risk_reward(scenarios)
        stop_loss = self._calculate_stop_loss(conviction, scenarios)
        position_sizing = self._kelly_criterion(scenarios, allocation_pct)
        portfolio_risk = self._assess_portfolio_risk(portfolio_summary, allocation_pct)
        
        return {
            "scenarios": scenarios,
            "expected_value": ev,
            "risk_reward_ratio": risk_reward,
            "stop_loss": stop_loss,
            "position_sizing": position_sizing,
            "portfolio_risk": portfolio_risk,
            "overall_risk_score": self._calculate_risk_score(scenarios, portfolio_risk)
        }

    def _scenario_analysis(self, article_text: str, conviction: float) -> Dict:
        """TFC V2.0: AI-GENERATED DYNAMIC SCENARIOS"""
        model_name = os.environ.get("DEFAULT_MODEL", "gemma-4-31b-it")
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel(model_name)
        safety = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]
        
        prompt = f"""
        AGENT: TACTICAL RISK ANALYST. 
        NEWS: {article_text}
        CONVICTION: {conviction}

        TASK: Generate 4 specific market scenarios (Bull, Base, Bear, Black Swan) tailored to THIS article.
        Explain the 'Why' for each scenario based on the specific news.

        STRICT JSON FORMAT:
        {{
            "bull_case": {{"probability": 0-1, "return": 0-1, "narrative": "..."}},
            "base_case": {{"probability": 0-1, "return": 0-1, "narrative": "..."}},
            "bear_case": {{"probability": 0-1, "return": 0-1, "narrative": "..."}},
            "black_swan": {{"probability": 0-1, "return": 0-1, "narrative": "..."}}
        }}
        """
        try:
            response = model.generate_content(prompt, safety_settings=safety)
            raw_text = response.text
            logging.info(f"AI Risk Raw Response: {raw_text[:100]}...")
            
            # Index-based slicing
            start = raw_text.find('{')
            end = raw_text.rfind('}')
            if start != -1 and end != -1:
                return json.loads(raw_text[start:end+1])
            return json.loads(raw_text.replace('```json', '').replace('```', '').strip())
        except Exception as e:
            logging.error(f"AI Risk Assessment Failed: {e}")
            # Safe Fallback
            return {
                "bull_case": {"probability": 0.3, "return": 0.2, "narrative": "Generic Upside"},
                "base_case": {"probability": 0.5, "return": 0.05, "narrative": "Market Drift"},
                "bear_case": {"probability": 0.15, "return": -0.15, "narrative": "Generic Correction"},
                "black_swan": {"probability": 0.05, "return": -0.40, "narrative": "Tail Risk"}
            }

    # Internal math remains for baseline calculations
    def _calculate_expected_value(self, scenarios: Dict) -> float:
        return sum(s['probability'] * s['return'] for s in scenarios.values())
    
    def _calculate_risk_reward(self, scenarios: Dict) -> float:
        upside = scenarios['bull_case']['return']
        downside = abs(scenarios['bear_case']['return'])
        return upside / downside if downside > 0 else 999
    
    def _calculate_stop_loss(self, conviction: float, scenarios: Dict) -> Dict:
        stop_pct = -0.12 if conviction > 0.8 else -0.10 if conviction > 0.6 else -0.08
        return {
            "stop_loss_pct": stop_pct,
            "reasoning": f"Conviction: {conviction:.0%} → {abs(stop_pct):.0%} hard stop for protection",
            "type": "HARD_STOP"
        }
    
    def _kelly_criterion(self, scenarios: Dict, recommended_allocation: float) -> Dict:
        p_win = scenarios['bull_case']['probability'] + scenarios['base_case']['probability']
        p_loss = 1 - p_win
        avg_win = (scenarios['bull_case']['return'] * scenarios['bull_case']['probability'] + 
                   scenarios['base_case']['return'] * scenarios['base_case']['probability']) / p_win
        avg_loss = abs(scenarios['bear_case']['return'])
        b = avg_win / avg_loss if avg_loss > 0 else 1
        kelly_pct = (p_win * b - p_loss) / b if b > 0 else 0
        kelly_pct = max(0, min(kelly_pct, 0.20)) # Cap at 20%
        return {
            "kelly_full": kelly_pct,
            "recommended": recommended_allocation,
            "validation": "STRICT"
        }
    
    def _assess_portfolio_risk(self, portfolio_summary: Dict, new_allocation: float) -> Dict:
        current_deployment = portfolio_summary.get('total_deployed', 0)
        return {
            "new_deployment": current_deployment + new_allocation,
            "risk_status": "MONITORED"
        }
    
    def _calculate_risk_score(self, scenarios: Dict, portfolio_risk: Dict) -> float:
        return 5.0 # Baseline score


# ============================================================================
# EXIT STRATEGY PLANNER
# ============================================================================

class ExitStrategyPlanner:
    """TFC V2.0: AI-DRIVEN TIERED EXIT PROTOCOLS"""
    
    def plan_exit(self, story: Dict, cognitive_analysis: Dict, risk_assessment: Dict) -> Dict:
        model_name = os.environ.get("DEFAULT_MODEL", "gemma-4-31b-it")
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel(model_name)
        safety = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]
        
        article_text = story.get('content') or story.get('main_topic', 'Unknown')
        
        prompt = f"""
        AGENT: TACTICAL EXIT STRATEGIST.
        NEWS: {article_text}
        ANALYSIS: {cognitive_analysis}
        RISK: {risk_assessment}

        TASK: Create a specific, tiered Exit Strategy (Tier 1 Target, Tier 2 Target, Stop-Loss).
        Define 3 'Thesis Invalidation Signals' specific to this news.

        STRICT JSON FORMAT:
        {{
            "strategy_type": "TIERED_EXIT",
            "targets": [
                {{"target_pct": 0.15, "position_to_close": 0.5, "logic": "..."}},
                {{"target_pct": 0.40, "position_to_close": 1.0, "logic": "..."}}
            ],
            "stop_loss_pct": -0.10,
            "invalidation_signals": ["...", "...", "..."]
        }}
        """
        try:
            response = model.generate_content(prompt, safety_settings=safety)
            raw_text = response.text
            logging.info(f"AI Exit Logic Raw Response: {raw_text[:100]}...")
            
            # Index-based slicing
            start = raw_text.find('{')
            end = raw_text.rfind('}')
            if start != -1 and end != -1:
                return json.loads(raw_text[start:end+1])
            return json.loads(raw_text.replace('```json', '').replace('```', '').strip())
        except Exception as e:
            logging.error(f"AI Exit Strategy Failed: {e}")
            return {
                "strategy_type": "GENERIC_TIERED",
                "targets": [{"target_pct": 0.10, "position_to_close": 0.5, "logic": "Initial profit taking"}],
                "stop_loss_pct": -0.08,
                "invalidation_signals": ["Negative news momentum", "Price break below 200DMA"]
            }

    def create_exit_plan(self, entry_price: float, conviction: float, thesis: Dict) -> Dict:
        if conviction >= 0.8:
            return self._high_conviction_strategy(entry_price)
        elif conviction >= 0.5:
            return self._medium_conviction_strategy(entry_price)
        else:
            return self._low_conviction_strategy(entry_price)
    
    def _high_conviction_strategy(self, entry_price: float) -> Dict:
        return {
            "strategy_type": "TIERED",
            "conviction_level": "HIGH",
            "exits": [
                {"exit_number": 1, "trigger_type": "PRICE_TARGET", "trigger_price": entry_price * 1.20, "position_size": 0.33},
                {"exit_number": 2, "trigger_type": "PRICE_TARGET", "trigger_price": entry_price * 1.50, "position_size": 0.33},
                {"exit_number": 3, "trigger_type": "TRAILING_STOP", "trail_percent": 0.10, "position_size": 0.34}
            ],
            "stop_loss": {"type": "HARD_STOP", "price": entry_price * 0.88}
        }
    
    def _medium_conviction_strategy(self, entry_price: float) -> Dict:
        return {
            "strategy_type": "TIERED",
            "conviction_level": "MEDIUM",
            "exits": [
                {"exit_number": 1, "trigger_type": "PRICE_TARGET", "trigger_price": entry_price * 1.25, "position_size": 0.50},
                {"exit_number": 2, "trigger_type": "TRAILING_STOP", "trail_percent": 0.08, "position_size": 0.50}
            ],
            "stop_loss": {"type": "HARD_STOP", "price": entry_price * 0.90}
        }
    
    def _low_conviction_strategy(self, entry_price: float) -> Dict:
        return {
            "strategy_type": "SINGLE_EXIT",
            "conviction_level": "LOW",
            "exits": [
                {"exit_number": 1, "trigger_type": "PRICE_TARGET", "trigger_price": entry_price * 1.15, "position_size": 1.0}
            ],
            "stop_loss": {"type": "HARD_STOP", "price": entry_price * 0.92}
        }
