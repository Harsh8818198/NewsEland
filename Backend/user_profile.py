from dataclasses import dataclass

@dataclass
class UserProfile:
    """
    Representation of the User's Financial Soul.
    """
    user_id: str
    risk_tolerance: str  # Conservative, Moderate, Aggressive, Contrarian
    capital_available: float
    investment_horizon: str # Short-term, Medium-term, Long-term
    portfolio_holdings: list = None # Optional existing holdings

    def get_risk_profile_description(self):
        desc = {
            "Conservative": "Prioritizes capital preservation. Low volatility tolerance.",
            "Moderate": "Balanced growth and protection. Can withstand some volatility.",
            "Aggressive": "Maximizing returns. High volatility tolerance.",
            "Contrarian": "Seeks asymmetric bets against the consensus."
        }
        return desc.get(self.risk_tolerance, "Unknown profile")
