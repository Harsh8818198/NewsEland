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

# ============================================================================
# PORTFOLIO MANAGER
# ============================================================================

class PortfolioManager:
    """Tracks positions, sector exposure, validates allocations"""
    
    def __init__(self, user_profile, portfolio_file='portfolio.json'):
        self.user = user_profile
        self.portfolio_file = portfolio_file
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
        return {
            "cash_reserve": self.cash_reserve,
            "total_deployed": self.total_deployed,
            "positions_count": len(self.positions),
            "sector_exposure": self.sector_exposure,
            "positions": self.positions
        }


# ============================================================================
# RISK ENGINE
# ============================================================================

class RiskEngine:
    """Scenario analysis, Kelly Criterion, stop-loss recommendations"""
    
    def assess_risk(self, story: Dict, recommendation: Dict, portfolio_summary: Dict) -> Dict:
        conviction = story.get('thesis', {}).get('conviction_score', 0.5)
        allocation_pct = recommendation.get('capital_allocation_pct', 0) / 100
        
        scenarios = self._scenario_analysis(conviction)
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
    
    def _scenario_analysis(self, conviction: float) -> Dict:
        if conviction > 0.8:
            probs = {"bull": 0.40, "base": 0.45, "bear": 0.12, "black_swan": 0.03}
            returns = {"bull": 0.50, "base": 0.25, "bear": -0.10, "black_swan": -0.30}
        elif conviction > 0.6:
            probs = {"bull": 0.30, "base": 0.50, "bear": 0.15, "black_swan": 0.05}
            returns = {"bull": 0.35, "base": 0.15, "bear": -0.15, "black_swan": -0.40}
        else:
            probs = {"bull": 0.20, "base": 0.50, "bear": 0.25, "black_swan": 0.05}
            returns = {"bull": 0.25, "base": 0.10, "bear": -0.20, "black_swan": -0.50}
        
        return {
            "bull_case": {"probability": probs["bull"], "return": returns["bull"]},
            "base_case": {"probability": probs["base"], "return": returns["base"]},
            "bear_case": {"probability": probs["bear"], "return": returns["bear"]},
            "black_swan": {"probability": probs["black_swan"], "return": returns["black_swan"]}
        }
    
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
            "reasoning": f"Conviction: {conviction:.0%} → {abs(stop_pct):.0%} stop",
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
        kelly_pct = max(0, min(kelly_pct, 0.15))
        half_kelly = kelly_pct / 2
        
        return {
            "kelly_full": kelly_pct,
            "kelly_half": half_kelly,
            "recommended": recommended_allocation,
            "kelly_validation": "APPROVED" if recommended_allocation <= kelly_pct else "OVERSIZED"
        }
    
    def _assess_portfolio_risk(self, portfolio_summary: Dict, new_allocation: float) -> Dict:
        current_deployment = portfolio_summary.get('total_deployed', 0)
        new_deployment = current_deployment + new_allocation
        max_sector = max(portfolio_summary.get('sector_exposure', {}).values()) if portfolio_summary.get('sector_exposure') else 0
        
        return {
            "new_deployment": new_deployment,
            "deployment_risk": "HIGH" if new_deployment > 0.75 else "MEDIUM" if new_deployment > 0.5 else "LOW",
            "max_sector_concentration": max_sector
        }
    
    def _calculate_risk_score(self, scenarios: Dict, portfolio_risk: Dict) -> float:
        downside = abs(scenarios['bear_case']['return']) * scenarios['bear_case']['probability']
        downside += abs(scenarios['black_swan']['return']) * scenarios['black_swan']['probability']
        downside_score = downside * 10
        deployment_score = portfolio_risk['new_deployment'] * 5
        concentration_score = portfolio_risk['max_sector_concentration'] * 10
        return min(10, (downside_score + deployment_score + concentration_score) / 3)


# ============================================================================
# EXIT STRATEGY PLANNER
# ============================================================================

class ExitStrategyPlanner:
    """Tiered exit strategies based on conviction"""
    
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
