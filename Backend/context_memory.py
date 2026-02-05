import json
import os
import logging
from datetime import datetime

class ContextMemory:
    """
    The Hippocampus: Stores the evolving "Narrative" of the market.
    Maps disparate news events into cohesive "Stories" over time.
    """
    def __init__(self, db_file='knowledge_graph.json'):
        self.db_file = db_file
        self.knowledge_graph = self._load_graph()

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

    def find_related_story(self, entities):
        """
        Checks if incoming entities match an existing active story.
        Returns topic_id or None.
        """
        for topic_id, story in self.knowledge_graph['stories'].items():
            if story['status'] == 'ARCHIVED':
                continue
            
            cached_entities = set(story['entities'])
            new_entities = set(entities['ORG'] + entities['GPE'] + entities['PRODUCT'])
            
            if len(cached_entities.intersection(new_entities)) > 0:
                return topic_id
        return None

    def update_story(self, article, analysis, entities):
        """
        Main Logic: Ingest News -> Update Graph -> Return Advice Context
        """
        related_entities = entities.get('ORG', []) + entities.get('GPE', []) + entities.get('PRODUCT', [])
        topic_id = self.find_related_story(entities)
        
        timestamp = datetime.now().isoformat()
        
        if topic_id:
            story = self.knowledge_graph['stories'][topic_id]
            story['events'].append({
                "date": timestamp,
                "title": article['title'],
                "sentiment": analysis['analysis']['sentiment'],
                "pattern": analysis['analysis']['matched_patterns'][0]['pattern_name'] if analysis['analysis']['matched_patterns'] else "None"
            })
            story['updates_count'] += 1
            story['entities'] = list(set(story['entities'] + related_entities))
            
            if story['updates_count'] >= 2:
                story['maturity'] = 'MATURE'
            
            logging.info(f"Updated Story: {topic_id} (Maturity: {story['maturity']})")
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
                "events": [{
                    "date": timestamp,
                    "title": article['title'],
                    "sentiment": analysis['analysis']['sentiment'],
                    "pattern": pattern_name
                }]
            }
            self.knowledge_graph['stories'][new_topic_id] = new_story
            logging.info(f"Created New Story: {new_topic_id}")
            self._save_graph()
            return new_story
