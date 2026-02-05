import google.generativeai as genai
import logging
import json
import time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

import os
from dotenv import load_dotenv

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
                self.model = genai.GenerativeModel('gemini-2.0-flash')
            except:
                logging.warning("Failed to init Gemini. Falling back to Mock Mode.")
                self.mock_mode = True

    def generate_report(self, article, analysis_result, story_context=None):
        """
        Synthesizes BRAIN 1 (News) and BRAIN 3 (Analysis) into a readable report.
        """
        if self.mock_mode:
            return self._generate_mock_report(article, analysis_result)

        try:
            prompt = self._construct_prompt(article, analysis_result, story_context)
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logging.error(f"Gemini Report Gen Failed: {e}")
            return self._generate_mock_report(article, analysis_result)

    def _construct_prompt(self, article, analysis, story_context=None):
        """
        Detailed prompt engineering for the Sub-Report (NOW WITH MEMORY).
        """
        history_str = "No prior events."
        if story_context and len(story_context.get('events', [])) > 1:
            events_list = story_context['events'][:-1] # All except current
            history_str = "\n".join([f"- {e['date'][:10]}: {e['title']} ({e['sentiment'].get('sentiment_label')})" for e in events_list])

        patterns_str = "\n".join([f"- {p['pattern_name']}: {p['historical_outcome']}" for p in analysis['analysis']['matched_patterns']])
        second_order_str = "\n".join([f"- {s}" for s in analysis['analysis']['second_order_effects']])

        return f"""
        You are an elite financial intelligence analyst (The Dialectical Synthesizer).
        
        **CURRENT NEWS**: "{article['title']}"
        **SOURCE**: {article.get('source', 'Unknown')}
        
        **CONTEXTUAL HISTORY (The Narrative Arc)**:
        {history_str}
        
        **SYSTEM ANALYSIS (BRAIN 3)**:
        - Sentiment: {analysis['analysis']['sentiment'].get('sentiment_label')}
        - Historical Patterns Detected:
        {patterns_str}
        - Potential Second-Order Effects:
        {second_order_str}
        
        **TASK**:
        Generate a "Strategic Intelligence Report" that connects the dots.
        
        1. **Narrative Evolution**: strictly compare the PAST history with THIS new event. 
           - Is the story accelerating? 
           - Is this a contradiction?
           - What is the *relation* between what we knew before and what we know now?
        
        2. **The Historical Lens**: Compare this sequence to the identified historical patterns. 
        
        3. **Probabilistic Projection**:
           - **Scenario A (Base Case)**: Most likely outcome next month.
           - **Scenario B (Contrarian Case)**: Low probability but high impact.
        
        4. **Actionable Intelligence**:
           - **Direct Plays**: Specific tickers to Watch/Buy/Sell.
           - **Hidden Gems**: Indirect beneficiaries (Second-order effects).
        
        5. **Confidence Score**: 0-100.
        
        Format as Markdown.
        """

    def _generate_mock_report(self, article, analysis):
        """
        Fallback report for testing/demo.
        """
        logging.info("Generating MOCK Sub-Report...")
        patterns = analysis['analysis']['matched_patterns']
        pattern_name = patterns[0]['pattern_name'] if patterns else "None"
        
        # Extract entities and effects from analysis
        entities = analysis.get('entities', {})
        org_list = entities.get('ORG', []) if isinstance(entities, dict) else ['Review Sector']
        second_order = analysis.get('analysis', {}).get('second_order_effects', [])
        
        return f"""

Crucial development in the sector. System has detected a significant correlation with historical **{pattern_name}** events. Immediate attention required.

This event structurally mirrors:
{chr(10).join([f"- **{p['pattern_name']}**: {p['historical_outcome']} (e.g., {p['example']})" for p in patterns])}

- **Scenario A (65%)**: Supply constraints drive pricing power. Margins likely to expand for top-tier suppliers.
- **Scenario B (35%)**: Demand destruction occurs faster than expected due to macro headwinds.

- **Direct Plays**: {', '.join(org_list if org_list else ['Review Sector'])}
- **Hidden Gems (2nd Order)**:
{chr(10).join([f"  * {eff}" for eff in second_order])}

*Analysis derived from Knowledge Graph v1.0*
        """

if __name__ == "__main__":
    gen = SubReportGenerator(mock_mode=True)
    print(gen.generate_report(
        {'title': 'Test News'}, 
        {'analysis': {'matched_patterns': [{'pattern_name': 'Test Pattern', 'historical_outcome': 'Test Outcome', 'example': 'Test Ex'}], 'second_order_effects': ['Test Effect'], 'sentiment': {}}}
    ))
