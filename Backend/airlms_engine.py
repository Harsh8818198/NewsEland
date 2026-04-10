import os
import logging
from typing import Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(".env.local", override=True)

class AIRLMSEngine:
    """
    PORTED FROM TFC.PDF SPECIFICATION
    The 5-Layer Reasoning Engine (Autonomous Investment Reasoning & Logic Multi-Layer System)
    """
    def __init__(self):
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
        model_name = os.environ.get("DEFAULT_MODEL", "gemma-4-31b-it")
        self.model = genai.GenerativeModel(model_name)

    def deep_reason(self, article_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        TFC V2.0: MULTI-AGENT SEQUENTIAL REASONING CHAIN
        Executes 5 distinct cognitive phases as defined in TFC.pdf
        """
        model_name = os.environ.get("DEFAULT_MODEL", "gemma-4-31b-it")
        model = genai.GenerativeModel(model_name)
        safety = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]
        
        try:
            # PHASE 1: THE PERCEPTOR (Signal Extraction)
            p1_response = model.generate_content(f"AGENT: PERCEPTOR. TASK: Extract every granular market signal, entity, and raw economic fact from this news: {article_text}", safety_settings=safety)
            perception = p1_response.text

            # PHASE 2: THE HISTORIAN (Contextualization & Parallels)
            p2_response = model.generate_content(f"AGENT: HISTORIAN. DATA: {perception}. CONTEXT: {context}. TASK: Map this to historical market parallels. What previous event does this mirror?", safety_settings=safety)
            contextualization = p2_response.text

            # PHASE 3: THE CONTRARIAN (Dialectical Analysis)
            p3_response = model.generate_content(f"AGENT: CONTRARIAN. DATA: {perception}. HISTORY: {contextualization}. TASK: Execute Dialectical Analysis. Provide the 'Bear Case' for this Bullish news, or vice versa. What is the hidden trap?", safety_settings=safety)
            analysis = p3_response.text

            # PHASE 4: THE SYNTHESIZER (Narrative Compression)
            p4_response = model.generate_content(f"AGENT: SYNTHESIZER. INPUTS: [P:{perception}, H:{contextualization}, C:{analysis}]. TASK: Compress these into a single emergent thesis. Is the current investment narrative shifting?", safety_settings=safety)
            synthesis = p4_response.text

            # PHASE 5: THE TACTICAL OFFICER (Strategic Recommendation)
            p5_response = model.generate_content(f"AGENT: TACTICAL OFFICER. FINAL INPUT: {synthesis}. TASK: Provide a specific, actionable ENTRY/EXIT/WATCH protocol with risk-adjusted conviction.", safety_settings=safety)
            recommendation_raw = p5_response.text

            # Final Output Synthesis into UI-ready JSON
            final_prompt = f"""
            CONVERT THE FOLLOWING AGENT CHAIN INTO A STRUCTURED JSON DOSSIER:
            Perception: {perception}
            Contextualization: {contextualization}
            Analysis: {analysis}
            Synthesis: {synthesis}
            Recommendation: {recommendation_raw}

            STRICT JSON FORMAT:
            {{
                "layer_1_perception": "...",
                "layer_2_contextualization": "...",
                "layer_3_analysis": "...",
                "layer_4_synthesis": "...",
                "layer_5_recommendation": "...",
                "action": "ENTRY|EXIT|WATCH",
                "confidence": 0-1
            }}
            """
            final_json = model.generate_content(final_prompt, safety_settings=safety)
            raw_text = final_json.text
            
            import json
            try:
                # Index-based slicing
                start = raw_text.find('{')
                end = raw_text.rfind('}')
                if start != -1 and end != -1:
                    return json.loads(raw_text[start:end+1])
                return json.loads(raw_text.replace('```json', '').replace('```', '').strip())
            except Exception as jse:
                logging.error(f"AIRLMS JSON Parse Error: {jse}. Raw: {raw_text[:200]}")
                raise jse

        except Exception as e:
            logging.error(f"TFC Agent Chain Failure: {e}")
            return {
                "layer_1_perception": "Chain-of-thought failure",
                "layer_5_recommendation": f"Error: {str(e)}",
                "action": "WATCH",
                "confidence": 0
            }

# Singleton instance
airlms = AIRLMSEngine()
