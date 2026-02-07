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
        NOW PURELY GENERATIVE (Brain Transplant Phase).
        """
        try:
            return self._generate_cognitive_advice(user_profile, sub_report_text, story_context)
        except Exception as e:
            logging.error(f"Cognitive Advice Failed: {e}")
            return "⚠️ System Overload. Unable to generate cognitive advice. Please analyze manually."

    def _generate_cognitive_advice(self, user, report, story):
        topic = story.get('main_topic', 'Unknown') if story else "New Unknown Event"
        history = story.get('events', []) if story else []
        
        # 1. Construct the Narrative Arc (History)
        narrative_arc = ""
        if history:
            narrative_arc = "STORY EVOLUTION:\n"
            for event in history[-5:]: # Last 5 events
                narrative_arc += f"- {event['date'][:10]}: {event['title']} (Sentiment: {event.get('sentiment', 'Unknown')})\n"
        else:
            narrative_arc = "STORY EVOLUTION: This is a Breaking Story (First Event)."

        # 2. Extract Maturity Intelligence (NEW)
        maturity_data = story.get('maturity_assessment', {}) if story else {}
        investment_rec = maturity_data.get('investment_recommendation', {})
        
        # 3. Deep Persona Prompt (Enhanced with Maturity Data)
        prompt = f"""
        ACT AS AN ELITE FINANCIAL ADVISOR.
        
        WHO YOU ARE:
        - Role: Personal Investment Strategist
        - Client Profile: {user.risk_tolerance}
        - Client Description: {user.get_risk_profile_description()}
        - Portfolio Capital: ${user.capital_available:,.2f}
        - Horizon: {user.investment_horizon}
        
        THE SITUATION:
        We are tracking the narrative: "{topic}"
        
        {narrative_arc}
        
        LATEST INTELLIGENCE:
        {report}
        
        MATURITY INTELLIGENCE (AI Market Cycle Analysis):
        - Market Cycle Phase: {maturity_data.get('market_cycle_phase', 'Unknown')}
        - Confidence Score: {maturity_data.get('confidence_score', 0):.0%}
        - Data Sufficiency: {maturity_data.get('data_sufficiency', 'Unknown')}
        - Recommended Allocation: {investment_rec.get('capital_allocation_pct', 0):.1f}% of capital
        - Optimal Timing: {investment_rec.get('optimal_timing', 'Unknown')}
        - Exit Strategy: {investment_rec.get('exit_strategy', 'TBD')}
        - AI Reasoning: {investment_rec.get('reasoning', 'N/A')}
        
        YOUR TASK:
        Synthesize a deep, strategic move. Do NOT be generic.
        1. Compare the LATEST news with the PAST evolution. Has the thesis changed?
        2. Apply your "{user.risk_tolerance}" personality. (e.g., If Contrarian, look for panic to buy. If Conservative, avoid volatility).
        3. Use the MATURITY INTELLIGENCE to determine if this is the right time to act.
        4. Give a SPECIFIC instruction with EXACT dollar amounts.
        
        OUTPUT FORMAT (Markdown):
        
        🧭 **STRATEGIC MEMO ({user.risk_tolerance})**
        
        🧠 **COGNITIVE SYNTHESIS**:
        (Explain your reasoning. Connect the dots between past events and this new update. Reference the market cycle phase.)
        
        ⚖️ **THESIS CHECK**:
        [VALIDATED | BROKEN | SHIFTING | NEW]
        
        👉 **DIRECTIVE**:
        Be SPECIFIC. Include:
        - Exact dollar amount (e.g., "Allocate $8,500 (8.5% of capital)")
        - Entry timing (e.g., "Enter within 24 hours" or "Wait for 10% dip")
        - Exit strategy (e.g., "Take profit at +25%" or "Hold for 6 months")
        """
        
        response = self.subreport_gen.model.generate_content(prompt)
        return response.text

