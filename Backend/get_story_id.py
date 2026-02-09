import json

# Load knowledge graph
with open('data/knowledge_graph.json', 'r') as f:
    kg = json.load(f)

stories = kg.get('stories', {})

# Find ACTIONABLE stories
for sid, story in stories.items():
    if story.get('maturity') == 'ACTIONABLE':
        print(f"Full Story ID: {sid}")
        print(f"Topic: {story.get('main_topic', 'Unknown')}")
        print(f"Sentiment: {story.get('current_hypothesis', {}).get('sentiment_label', 'Neutral')}")
        
        # Get ticker suggestion
        cognitive = story.get('cognitive', {})
        winners = cognitive.get('winners', [])
        if winners:
            print(f"Suggested Ticker: {winners[0].get('ticker', 'N/A')}")
        print()
        break
