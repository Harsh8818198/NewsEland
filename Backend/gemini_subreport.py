import google.generativeai as genai
import logging
import json
import time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

import os
from dotenv import load_dotenv
load_dotenv(override=True)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

class SubReportGenerator:
    """
    BRAIN 3: The Dialectical Synthesizer (Part A)
    Generates the "Sub-Report" comparing current news to history.
    """
    def __init__(self, mock_mode=False):
        self.mock_mode = mock_mode
        if not self.mock_mode:
            try:
                model_name = os.getenv('DEFAULT_MODEL', 'gemma-4-31b-it')
                self.model = genai.GenerativeModel(model_name)
            except:
                logging.warning("Failed to init Gemini. Falling back to Mock Mode.")
                self.mock_mode = True

    def generate_sub_report(self, article, analysis_result, story_context=None):
        """
        Synthesizes BRAIN 1 (News) and BRAIN 3 (Analysis) into a readable report.
        """
        if self.mock_mode:
            return self._generate_mock_report(article, analysis_result)

        try:
            prompt = self._construct_prompt(article, analysis_result, story_context)
            safety = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            response = self.model.generate_content(prompt, safety_settings=safety)
            return response.text
        except Exception as e:
            logging.error(f"Gemini Report Gen Failed: {e}")
            return self._generate_mock_report(article, analysis_result)

    def _construct_prompt(self, article, analysis, story_context=None):
        """
        Detailed prompt engineering for the Sub-Report (NOW WITH MEMORY).
        """
        history_str = "No prior events."
        state_comparison = "No prior state recorded."

        if story_context:
            if len(story_context.get('events', [])) > 1:
                events_list = story_context['events'][:-1] # All except current
                history_str = "\n".join([f"- {e['date'][:10]}: {e.get('title', 'Unknown Event')} ({e['sentiment'].get('sentiment_label')})" for e in events_list])
            
            # BEFORE VS AFTER LOGIC
            prev = story_context.get('previous_hypothesis')
            curr = story_context.get('current_hypothesis', analysis['analysis']['sentiment'])
            
            if prev:
                state_comparison = f"""
                **PREVIOUS HYPOTHESIS (Before this event)**:
                - Why: {prev.get('why')}
                - Expected Impact: {prev.get('expected_impact')}
                
                **CURRENT HYPOTHESIS (After this event)**:
                - Why: {curr.get('why')}
                - Expected Impact: {curr.get('expected_impact')}
                """

        patterns_str = "\n".join([f"- {p['pattern_name']}: {p['historical_outcome']}" for p in analysis['analysis']['matched_patterns']])
        second_order_str = "\n".join([f"- {s}" for s in analysis['analysis']['second_order_effects']])

        return f"""
        You are an elite financial intelligence analyst (The Dialectical Synthesizer).
        
        **CURRENT NEWS**: "{article.get('title', 'Unknown Title')}"
        **SOURCE**: {article.get('source', 'Unknown')}
        
        **CONTEXTUAL HISTORY (The Narrative Arc)**:
        {history_str}
        
        **EVOLUTION SENSOR (Before vs After)**:
        {state_comparison}

        **SYSTEM ANALYSIS (BRAIN 3)**:
        - Deep Insight (Why): {analysis['analysis']['sentiment'].get('why')}
        - Deep Insight (How): {analysis['analysis']['sentiment'].get('how')}
        - Historical Patterns Detected:
        {patterns_str}
        - Potential Second-Order Effects:
        {second_order_str}
        
        **TASK**:
        Generate a "Strategic Intelligence Report" that connects the dots.
        
        1. **Narrative Evolution**: strictly compare the PAST history with THIS new event. 
           - Is the story accelerating? 
           - Is this a contradiction?
           - **Explicitly mention the shift from the Previous Hypothesis to Current.**
        
        2. **The Historical Lens**: Compare this sequence to the identified historical patterns. 
        
        3. **Probabilistic Projection**:
           - **Scenario A (Base Case)**: Most likely outcome next month.
           - **Scenario B (Contrarian Case)**: Low probability but high impact.
        
        4. **Actionable Intelligence**:
           - **Direct Plays**: Specific tickers to Watch/Buy/Sell.
           - **Hidden Gems**: Indirect beneficiaries (Second-order effects).
        
        5. **Confidence Score**: 0-100.
        
        Format as Markdown. Use vivid language.
        """

    def _generate_mock_report(self, article, analysis):
        """
        Fallback report for testing/demo.
        """
        logging.info("Generating MOCK Sub-Report...")
        patterns = analysis['analysis']['matched_patterns']
        pattern_name = patterns[0]['pattern_name'] if patterns else "None"
        
        return f"""

Crucial development in the sector. System has detected a significant correlation with historical **{pattern_name}** events. Immediate attention required.

This event structurally mirrors:
{chr(10).join([f"- **{p['pattern_name']}**: {p['historical_outcome']} (e.g., {p['example']})" for p in patterns])}

- **Scenario A (65%)**: Supply constraints drive pricing power. Margins likely to expand for top-tier suppliers.
- **Scenario B (35%)**: Demand destruction occurs faster than expected due to macro headwinds.

- **Direct Plays**: {', '.join(analysis['entities'].get('ORG', ['Review Sector']))}
- **Hidden Gems (2nd Order)**:
{chr(10).join([f"  * {eff}" for eff in analysis['analysis']['second_order_effects']])}

*Analysis derived from Knowledge Graph v1.0*
        """

if __name__ == "__main__":
    gen = SubReportGenerator(mock_mode=True)
    print(gen.generate_report(
        {'title': 'Test News'}, 
        {'analysis': {'matched_patterns': [{'pattern_name': 'Test Pattern', 'historical_outcome': 'Test Outcome', 'example': 'Test Ex'}], 'second_order_effects': ['Test Effect'], 'sentiment': {}}}
    ))
