import json

# Load knowledge graph
with open('data/knowledge_graph.json', 'r') as f:
    kg = json.load(f)

stories = kg.get('stories', {})

print(f"\n{'='*80}")
print(f"Available Stories ({len(stories)} total)")
print(f"{'='*80}\n")

# Show first 10 ACTIONABLE or MATURE stories
actionable_stories = []
for sid, story in stories.items():
    maturity = story.get('maturity', 'UNKNOWN')
    if maturity in ['ACTIONABLE', 'MATURE']:
        actionable_stories.append((sid, story))

print("ACTIONABLE/MATURE Stories (best for trading):\n")
for i, (sid, story) in enumerate(actionable_stories[:10], 1):
    topic = story.get('main_topic', 'No topic')[:70]
    maturity = story.get('maturity', 'UNKNOWN')
    current_hyp = story.get('current_hypothesis', {})
    sentiment = current_hyp.get('sentiment_label', 'Neutral')
    
    print(f"{i}. Story ID: {sid[:12]}...")
    print(f"   Topic: {topic}")
    print(f"   Maturity: {maturity} | Sentiment: {sentiment}")
    print()

if not actionable_stories:
    print("No ACTIONABLE/MATURE stories found. Showing all stories:\n")
    for i, (sid, story) in enumerate(list(stories.items())[:10], 1):
        topic = story.get('main_topic', 'No topic')[:70]
        maturity = story.get('maturity', 'UNKNOWN')
        print(f"{i}. {sid[:12]}... - {topic} [{maturity}]")
