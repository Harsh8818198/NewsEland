import requests
import json

# API endpoint
BASE_URL = "http://localhost:8000"

# Load knowledge graph to get story details
with open('data/knowledge_graph.json', 'r') as f:
    kg = json.load(f)

stories = kg.get('stories', {})

# Find the ACTIONABLE story
story_id = "STORY_177065c1-e8e5-4f2e-b5a1-4e9c8f7d6a5b"  # The VC Tournament story
story = stories.get(story_id)

if not story:
    print(f"Story {story_id} not found!")
    exit(1)

print(f"\n{'='*80}")
print(f"Executing Trade on Story")
print(f"{'='*80}\n")
print(f"Story: {story.get('main_topic', 'Unknown')}")
print(f"Maturity: {story.get('maturity', 'UNKNOWN')}")
print(f"Sentiment: {story.get('current_hypothesis', {}).get('sentiment_label', 'Neutral')}")
print()

# Get cognitive analysis for ticker suggestion
cognitive = story.get('cognitive', {})
winners = cognitive.get('winners', [])

if winners:
    ticker = winners[0].get('ticker', 'TECH')
    sector = winners[0].get('sector', 'Technology')
else:
    # Default ticker for VC/Tech story
    ticker = "ARKK"  # ARK Innovation ETF (VC/Innovation focused)
    sector = "Technology"

print(f"Suggested Ticker: {ticker}")
print(f"Sector: {sector}")
print()

# Execute trade
trade_data = {
    "ticker": ticker,
    "sector": sector,
    "capital_allocation_pct": 15.0,  # 15% allocation
    "entry_price": 50.0,  # Mock entry price
    "story_id": story_id
}

print("Executing trade...")
print(f"Trade Data: {json.dumps(trade_data, indent=2)}")
print()

try:
    response = requests.post(f"{BASE_URL}/api/portfolio/trade", json=trade_data)
    
    if response.status_code == 200:
        result = response.json()
        print("✓ Trade executed successfully!")
        print(f"Response: {json.dumps(result, indent=2)}")
    else:
        print(f"✗ Trade failed with status {response.status_code}")
        print(f"Error: {response.text}")
except Exception as e:
    print(f"✗ Error executing trade: {e}")

print(f"\n{'='*80}")
print("Checking portfolio...")
print(f"{'='*80}\n")

try:
    response = requests.get(f"{BASE_URL}/api/portfolio")
    if response.status_code == 200:
        portfolio = response.json()
        print(f"✓ Portfolio loaded")
        print(f"Total Value: ${portfolio.get('total_value', 0):,.2f}")
        print(f"Positions: {len(portfolio.get('positions', []))}")
        print()
        
        for pos in portfolio.get('positions', []):
            print(f"  - {pos.get('ticker')}: {pos.get('shares')} shares @ ${pos.get('entry_price')}")
    else:
        print(f"✗ Failed to load portfolio: {response.status_code}")
except Exception as e:
    print(f"✗ Error loading portfolio: {e}")
