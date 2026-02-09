import json
import os

# Check knowledge graph
kg_path = 'data/knowledge_graph.json'
if os.path.exists(kg_path):
    with open(kg_path, 'r') as f:
        kg = json.load(f)
    print(f"✓ Knowledge Graph exists")
    print(f"  - Stories: {len(kg.get('stories', {}))}")
    print(f"  - Entities: {len(kg.get('entities', {}))}")
else:
    print("✗ No knowledge graph")

# Check portfolio
portfolio_path = 'data/portfolio.json'
if os.path.exists(portfolio_path):
    with open(portfolio_path, 'r') as f:
        portfolio = json.load(f)
    print(f"✓ Portfolio exists")
    print(f"  - Positions: {len(portfolio.get('positions', {}))}")
else:
    print("✗ No portfolio.json - Portfolio is EMPTY")

# Check analysis storage
analysis_path = 'data/analysis_storage.json'
if os.path.exists(analysis_path):
    with open(analysis_path, 'r') as f:
        analysis = json.load(f)
    print(f"✓ Analysis storage exists")
    print(f"  - Size: {os.path.getsize(analysis_path)} bytes")
else:
    print("✗ No analysis storage")
