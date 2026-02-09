import json
import os
import logging
from datetime import datetime
from maturity_engine import MaturityEngine

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

class ContextMemory:
    """
    The Hippocampus: Stores the evolving "Narrative" of the market.
    Maps disparate news events into cohesive "Stories" over time.
    """
    def __init__(self, db_file=None):
        # Always store knowledge graph in a stable data directory
        self.db_file = db_file or os.path.join(DATA_DIR, "knowledge_graph.json")
        self.knowledge_graph = self._load_graph()
        self.maturity_engine = MaturityEngine()  # NEW: AI-driven maturity assessment

    def _load_graph(self):
        if os.path.exists(self.db_file):
            try:
                with open(self.db_file, 'r') as f:
                    return json.load(f)
            except:
                return {"stories": {}}
        return {"stories": {}}

    def _save_graph(self):
        with open(self.db_file, 'w') as f:
            json.dump(self.knowledge_graph, f, indent=2)

    def reset(self):
        self.knowledge_graph = {"stories": {}}
        self._save_graph()

    def get_all_stories(self):
        """
        Retrieve all stories from knowledge graph
        Returns list of story objects
        """
        return list(self.knowledge_graph.get('stories', {}).values())

    def find_related_story(self, entities):
        """
        Checks if incoming entities match an existing active story.
        Returns topic_id or None.
        NOW USES STRICT MATCHING: Requires at least 2 shared entities OR 50% overlap.
        """
        for topic_id, story in self.knowledge_graph['stories'].items():
            if story['status'] == 'ARCHIVED':
                continue
            
            cached_entities = set(story['entities'])
            new_entities = set(entities['ORG'] + entities['GPE'] + entities['PRODUCT'])
            
            overlap = cached_entities.intersection(new_entities)
            
            # STRICT RULE: Require significant overlap
            # Option 1: At least 2 shared entities (prevents "AI" alone from merging everything)
            # Option 2: At least 50% of the smaller set overlaps
            if len(overlap) >= 2 or (len(overlap) > 0 and len(overlap) / min(len(cached_entities), len(new_entities)) >= 0.5):
                return topic_id
        return None

    def update_story(self, article, analysis, entities, cognitive_analysis=None, subreport=None):
        """
        Main Logic: Ingest News -> Update Graph -> Return Advice Context
        """
        related_entities = entities.get('ORG', []) + entities.get('GPE', []) + entities.get('PRODUCT', [])
        topic_id = self.find_related_story(entities)
        
        timestamp = datetime.now().isoformat()
        
        # Normalize sentiment shape once so both backend and frontend can use it
        raw_sentiment = analysis['analysis']['sentiment']
        normalized_sentiment = {
            "score": raw_sentiment.get("sentiment_score", 0),
            "label": raw_sentiment.get("sentiment_label", "Neutral"),
            **raw_sentiment,
        }

        if topic_id:
            story = self.knowledge_graph['stories'][topic_id]
            # STATE SNAPSHOT LOGIC:
            # Shift current hypothesis to previous to track evolution ("Before vs After")
            story['previous_hypothesis'] = story.get('current_hypothesis', {})
            story['current_hypothesis'] = normalized_sentiment  # Contains Why/What/How
            
            # Store latest cognitive analysis
            if cognitive_analysis:
                story['cognitive_analysis'] = cognitive_analysis

            event_data = {
                "date": timestamp,
                "title": article['title'],
                "sentiment": normalized_sentiment,
                "pattern": analysis['analysis']['matched_patterns'][0]['pattern_name'] if analysis['analysis']['matched_patterns'] else "None",
                "subreport": subreport  # Store subreport
            }
            
            # Add cognitive insights to event if available
            if cognitive_analysis:
                event_data['cognitive_insight'] = cognitive_analysis.get('so_what', 'N/A')
                event_data['winners'] = cognitive_analysis.get('winners', [])
                event_data['losers'] = cognitive_analysis.get('losers', [])
                event_data['real_world_opportunities'] = cognitive_analysis.get('real_world_opportunities', [])

            story['events'].append(event_data)
            story['updates_count'] += 1
            story['entities'] = list(set(story['entities'] + related_entities))
            
            # NEW: AI-Driven Maturity Assessment
            maturity_assessment = self.maturity_engine.assess_maturity(story)
            story['maturity_assessment'] = maturity_assessment
            story['maturity'] = maturity_assessment['maturity_level']  # For backward compatibility
            
            # Alert if story became actionable
            if maturity_assessment['maturity_level'] == 'ACTIONABLE':
                logging.warning(f"🚨 STORY ACTIONABLE: {story['main_topic']}")
                logging.warning(f"   Market Cycle: {maturity_assessment['market_cycle_phase']}")
                logging.warning(f"   Confidence: {maturity_assessment['confidence_score']:.0%}")
                logging.warning(f"   Recommendation: {maturity_assessment['investment_recommendation']}")
            
            logging.info(f"Updated Story: {topic_id} (Maturity: {story['maturity']}, Cycle: {maturity_assessment.get('market_cycle_phase', 'Unknown')})")
            self._save_graph()
            return story

        else:
            new_topic_id = f"STORY_{int(datetime.now().timestamp())}"
            pattern_name = analysis['analysis']['matched_patterns'][0]['pattern_name'] if analysis['analysis']['matched_patterns'] else "General Market"
            
            new_story = {
                "id": new_topic_id,
                "created_at": timestamp,
                "main_topic": f"{pattern_name} involving {related_entities[0] if related_entities else 'Unknown'}",
                "status": "ACTIVE",
                "maturity": "DEVELOPING", # Developing -> Mature -> Archived
                "entities": related_entities,
                "updates_count": 1,
                "current_hypothesis": normalized_sentiment, # Initial State
                "previous_hypothesis": None,
                "cognitive_analysis": cognitive_analysis, # Store initial cognitive analysis
                "events": [{
                    "date": timestamp,
                    "title": article['title'],
                    "sentiment": normalized_sentiment,
                    "pattern": pattern_name,
                    "subreport": subreport, # Store initial subreport
                    "cognitive_insight": cognitive_analysis.get('so_what', 'N/A') if cognitive_analysis else "N/A",
                    "winners": cognitive_analysis.get('winners', []) if cognitive_analysis else [],
                    "losers": cognitive_analysis.get('losers', []) if cognitive_analysis else [],
                    "real_world_opportunities": cognitive_analysis.get('real_world_opportunities', []) if cognitive_analysis else []
                }]
            }
            self.knowledge_graph['stories'][new_topic_id] = new_story
            logging.info(f"Created New Story: {new_topic_id}")
            self._save_graph()
            return new_story
