import json
import os
from supabase_sync import sync_engine
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

def migrate_history():
    # 1. Load the massive 1MB Knowledge Graph
    graph_path = os.path.join("data", "knowledge_graph.json")
    if not os.path.exists(graph_path):
        logging.error(f"Cannot find knowledge graph at {graph_path}")
        return

    logging.info(f"Loading intelligence archive from {graph_path}...")
    with open(graph_path, 'r') as f:
        graph = json.load(f)

    stories = graph.get('stories', {})
    total = len(stories)
    logging.info(f"Found {total} historical stories. Starting migration...")

    # 2. Push each story to Supabase
    count = 0
    for s_id, data in stories.items():
        try:
            # We use our new sync engine to push historical data
            sync_engine.sync_story(s_id, data)
            
            # If the story has a signal/recommendation, sync that too
            cognitive = data.get('cognitive_analysis', {})
            if cognitive:
                sync_engine.sync_signal(
                    user_id="USER_GLOBAL_SYNC",
                    story_id=s_id,
                    signal_data={
                        "ticker": data.get('entities', {}).get('ORG', ['MARKET'])[0] if data.get('entities') else 'MARKET',
                        "signal": "ENTRY" if data.get('maturity') == 'ACTIONABLE' else "WATCH",
                        "confidence": cognitive.get('conviction', 0.5),
                        "reasoning": f"Historical migration: {data.get('main_topic')}"
                    }
                )
            
            count += 1
            if count % 10 == 0:
                logging.info(f"Progress: {count}/{total} stories migrated...")
        except Exception as e:
            logging.error(f"Failed to migrate story {s_id}: {e}")

    logging.info(f"✅ MIGRATION COMPLETE: {count} stories now live in the SaaS Archive.")

if __name__ == "__main__":
    migrate_history()
