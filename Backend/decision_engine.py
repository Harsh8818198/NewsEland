import logging
from gemini_subreport import SubReportGenerator

class DecisionEngine:
    """
    BRAIN 2: The Dialectical Synthesizer (Part B)
    Generates the "Investment Decision Tree" based on Report + User Profile.
    """
    def __init__(self, mock_mode=False):
        self.mock_mode = mock_mode
        self.subreport_gen = SubReportGenerator(mock_mode=mock_mode)

    def generate_advice(self, user_profile, sub_report_text, story_context=None):
        """
        Synthesizes the Sub-Report + User Profile + Story Context (Memory).
        """
        if self.mock_mode:
            return self._mock_advice(user_profile, sub_report_text, story_context)
        return self._mock_advice(user_profile, sub_report_text, story_context)

    def _mock_advice(self, user, report, story):
        """
        The "Financial Guide" Logic.
        Decides based on:
        1. User Risk (Aggressive vs Conservative)
        2. Story Maturity (Developing vs Mature) - FROM MEMORY
        3. Signal Strength (from Report)
        """
        advice = f"\n🧭 **YOUR FINANCIAL GUIDE ({user.risk_tolerance} Profile)**\n"
        
        if not story:
            maturity = "UNKNOWN"
        else:
            maturity = story.get('maturity', 'DEVELOPING')
            advice += f"   Story Context: {story['main_topic']} ({maturity})\n"

        advice += f"   (Capital: ${user.capital_available:,.2f} | Horizon: {user.investment_horizon})\n\n"
        
        
        if maturity == "DEVELOPING":
            if user.risk_tolerance == "Aggressive":
                advice += f"👉 **Guidance**: WATCHLIST ONLY (Speculative Entry)\n"
                advice += f"   - This narrative is just forming. High risk, high reward.\n"
                advice += f"   - Action: Buy small 'starter position' (max 2% of capital).\n"
            else:
                advice += f"👉 **Guidance**: WAIT AND WATCH\n"
                advice += f"   - This story is too early for your profile.\n"
                advice += f"   - Action: Set an alert for 'Confirmation'. Do not buy yet.\n"
        
        elif maturity == "MATURE":
            if "Supply Crunch" in report or "Bull" in report:
                if user.risk_tolerance in ["Aggressive", "Contrarian"]:
                    allocation = user.capital_available * 0.40
                    advice += f"👉 **Guidance**: CONFIRMED STRONG BUY\n"
                    advice += f"   - Pattern is mature and verified. Time to strike.\n"
                    advice += f"   - Allocation: Up to 40% (${allocation:,.2f}).\n"
                    advice += f"   - Strategy: OTM Calls or Lev ETF.\n"
                else:
                    allocation = user.capital_available * 0.15
                    advice += f"👉 **Guidance**: ALLOCATE (Defensive)\n"
                    advice += f"   - Trend is solid. Safe to enter.\n"
                    advice += f"   - Allocation: 15% (${allocation:,.2f}) into Sector ETF.\n"
            
            elif "Regulatory" in report or "Bear" in report:
                advice += f"👉 **Guidance**: DEFENSIVE ROTATION\n"
                advice += f"   - Confirmed headwinds. Protect your capital.\n"
                advice += f"   - Action: Tighten stop losses or move to Cash/Gold.\n"

        else:
            advice += f"👉 **Guidance**: MONITOR\n"
            advice += f"   - Insufficient data to guide you yet.\n"
            
        advice += "\n⚠️ *AI Guide Logic v2.0*"
        return advice
