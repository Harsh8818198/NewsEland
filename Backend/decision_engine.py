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
        
        try:
            return self._generate_real_advice(user_profile, sub_report_text, story_context)
        except Exception as e:
            logging.error(f"Advice Generation Failed: {e}")
            return self._mock_advice(user_profile, sub_report_text, story_context)

    def _generate_real_advice(self, user, report, story):
        if not story:
             return self._mock_advice(user, report, story)

        # Reuse the heuristic logic to get the 'Signal'
        topic = story.get('main_topic', 'Unknown')
        prev_hyp = story.get('previous_hypothesis')
        curr_hyp = story.get('current_hypothesis')
        
        signal = "WATCHLIST"
        reasoning = "Monitor for developments."
        
        # ... (Reusing logic would be better, but for now let's let the LLM deduce it from the report) ...
        # Actually better to prompt the LLM with the explicit state change
        
        prompt = f"""
        You are an elite Investment Advisor for a '{user.risk_tolerance}' profile client.
        
        CONTEXT:
        We are tracking a story: "{topic}"
        
        LATEST NEWS REPORT:
        {report}
        
        EVOLUTION:
        Previous View: {prev_hyp.get('sentiment_label') if prev_hyp else 'None'}
        Current View: {curr_hyp.get('sentiment_label') if curr_hyp else 'None'}
        
        TASK:
        Generate a concise, actionable output in this format:
        
        🧭 **YOUR FINANCIAL GUIDE ({user.risk_tolerance} Profile)**
        State: [THESIS SHIFT | CONFIRMATION | DEGRADATION | NEW OPP]
        
        🔍 **ANALYSIS**:
        (1-2 sentences on why the thesis changed or strengthened)
        
        👉 **ACTIONABLE ADVICE**:
        (Specific instructions: Buy, Sell, Hold, Accumulate, or Watch. Be decisive.)
        """
        
        response = self.subreport_gen.model.generate_content(prompt)
        return response.text

    def _mock_advice(self, user, report, story):
        """
        The "Financial Guide" Logic (v3.0 - Before vs After)
        Decides based on the **Evolution** of the story.
        """
        advice = f"\n🧭 **YOUR FINANCIAL GUIDE ({user.risk_tolerance} Profile)**\n"
        
        if not story:
            return advice + "   (No Story Context available yet.)"

        topic = story.get('main_topic', 'Unknown')
        maturity = story.get('maturity', 'DEVELOPING')
        
        # 1. RETRIEVE STATES
        prev_hyp = story.get('previous_hypothesis')
        curr_hyp = story.get('current_hypothesis')
        
        # 2. ANALYZE THE DELTA (The "Before vs After" Logic)
        if not prev_hyp:
            # SCENARIO: NEW STORY DISCOVERED
            signal_type = "NEW_OPPORTUNITY"
            reasoning = "This is a fresh narrative just entering our radar."
            if user.risk_tolerance == "Aggressive":
                action = "**WATCHLIST (Pioneer)** - Buy small starter position."
            else:
                action = "**WATCHLIST (Observer)** - Wait for second confirmation."
        
        else:
            # COMPARE SENTIMENT & KEY EVENT TYPE
            prev_sent = prev_hyp.get('sentiment_label', 'Neutral')
            curr_sent = curr_hyp.get('sentiment_label', 'Neutral')
            
            if prev_sent != curr_sent:
                # SCENARIO: THESIS SHIFT (Major Event)
                signal_type = "THESIS_SHIFT"
                if curr_sent == "Bullish":
                    reasoning = f"Narrative has flipped BULLISH (was {prev_sent}). Validation received."
                    action = "**STRONG BUY** - The thesis has been confirmed by new data."
                elif curr_sent == "Bearish":
                    reasoning = f"Narrative has turned BEARISH (was {prev_sent}). Warning signs."
                    action = "**SELL / HEDGE** - The previous thesis is broken. Exit or reduce risk."
                else:
                    reasoning = "Narrative momentum has stalled (Neutral)."
                    action = "**HOLD** - Wait for clarity."
            
            else:
                # SCENARIO: THESIS CONFIRMATION (More of the same)
                signal_type = "THESIS_CONFIRMATION"
                reasoning = f"Narrative remains consistent ({curr_sent}). Confidence increasing."
                if curr_sent == "Bullish":
                    action = "**ACCUMULATE** - Add to position on dips."
                elif curr_sent == "Bearish":
                    action = "**AVOID** - Do not catch the falling knife."
                else:
                    action = "**IGNORE** - Noise."

        # 3. DISPLAY ADVICE
        advice += f"   Story: {topic}\n"
        advice += f"   State: {signal_type} ({maturity})\n"
        advice += f"   Capital: ${user.capital_available:,.2f}\n\n"
        
        advice += f"🔍 **ANALYSIS (The Shift)**:\n"
        advice += f"   {reasoning}\n\n"
        
        advice += f"👉 **ACTIONABLE ADVICE**:\n"
        advice += f"   {action}\n"
            
        advice += "\n⚠️ *AI Guide Logic v3.0 (Evolutionary Tracking)*"
        return advice
