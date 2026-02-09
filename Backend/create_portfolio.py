import json
import requests

# Load knowledge graph
with open('data/knowledge_graph.json', 'r') as f:
    kg = json.load(f)

stories = kg.get('stories', {})

print(f"\nTotal stories: {len(stories)}\n")

# Count by maturity
maturity_counts = {}
for sid, story in stories.items():
    maturity = story.get('maturity', 'UNKNOWN')
    maturity_counts[maturity] = maturity_counts.get(maturity, 0) + 1

print("Stories by Maturity:")
for maturity, count in sorted(maturity_counts.items()):
    print(f"  {maturity}: {count}")

print("\n" + "="*80)
print("Selecting best stories for portfolio...")
print("="*80 + "\n")

# Get best stories (any maturity, prefer Bullish sentiment)
selected_stories = []
for sid, story in stories.items():
    current_hyp = story.get('current_hypothesis', {})
    sentiment = current_hyp.get('sentiment_label', 'Neutral')
    maturity = story.get('maturity', 'UNKNOWN')
    
    if sentiment == 'Bullish' or maturity in ['MATURE', 'ACTIONABLE']:
        selected_stories.append((sid, story))
        if len(selected_stories) >= 3:
            break

if not selected_stories:
    # Just take first 3 stories
    selected_stories = list(stories.items())[:3]

print(f"Selected {len(selected_stories)} stories for trading:\n")

# Execute trades
BASE_URL = "http://localhost:8000"
trades_executed = 0

for i, (sid, story) in enumerate(selected_stories, 1):
    topic = story.get('main_topic', 'Unknown')[:60]
    maturity = story.get('maturity', 'UNKNOWN')
    current_hyp = story.get('current_hypothesis', {})
    sentiment = current_hyp.get('sentiment_label', 'Neutral')
    
    print(f"{i}. {topic}")
    print(f"   Maturity: {maturity} | Sentiment: {sentiment}")
    
    # Get ticker from cognitive or use default
    cognitive = story.get('cognitive', {})
    winners = cognitive.get('winners', [])
    
    if winners and winners[0].get('ticker'):
        ticker = winners[0].get('ticker')
        sector = winners[0].get('sector', 'Technology')
    else:
        # Default tickers based on sentiment
        if sentiment == 'Bullish':
            ticker = f"TECH{i}"
            sector = "Technology"
        else:
            ticker = f"STOCK{i}"
            sector = "General"
    
    # Execute trade
    trade_data = {
        "ticker": ticker,
        "sector": sector,
        "capital_allocation_pct": 10.0 + (i * 5),  # 15%, 20%, 25%
        "entry_price": 50.0 + (i * 10),  # $50, $60, $70
        "story_id": sid
    }
    
    print(f"   Trading: {ticker} @ ${trade_data['entry_price']} ({trade_data['capital_allocation_pct']}%)")
    
    try:
        response = requests.post(f"{BASE_URL}/api/portfolio/trade", json=trade_data, timeout=5)
        if response.status_code == 200:
            print(f"   ✓ Trade executed\n")
            trades_executed += 1
        else:
            print(f"   ✗ Failed: {response.status_code}\n")
    except Exception as e:
        print(f"   ✗ Error: {e}\n")

print("="*80)
print(f"Trades executed: {trades_executed}/{len(selected_stories)}")
print("="*80)

# Check portfolio
try:
    response = requests.get(f"{BASE_URL}/api/portfolio", timeout=5)
    if response.status_code == 200:
        portfolio = response.json()
        print(f"\n✓ Portfolio created successfully!")
        print(f"Total Value: ${portfolio.get('total_value', 0):,.2f}")
        print(f"Positions: {len(portfolio.get('positions', []))}")
    else:
        print(f"\n✗ Failed to load portfolio")
except Exception as e:
    print(f"\n✗ Error: {e}")
