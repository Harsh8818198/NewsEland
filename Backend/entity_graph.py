import json
import logging
from typing import Dict, List, Set
from collections import defaultdict

class EntityGraph:
    """
    Tracks relationships between entities (companies, people, products).
    
    Relationships:
    - PARTNERS_WITH: Strategic partnerships, collaborations
    - COMPETES_WITH: Direct competitors
    - SUPPLIES_TO: Supplier relationships
    - DEPENDS_ON: Dependencies (e.g., Apple depends on TSMC for chips)
    - OWNS: Ownership (e.g., Google owns YouTube)
    - INVESTED_IN: Investment relationships
    """
    
    def __init__(self, graph_file='entity_graph.json'):
        self.graph_file = graph_file
        self.entities = {}  # {entity_name: EntityNode}
        self._load_graph()
    
    def _load_graph(self):
        """Load graph from disk"""
        try:
            with open(self.graph_file, 'r') as f:
                self.entities = json.load(f)
        except:
            logging.info("No existing entity graph found, starting fresh")
    
    def _save_graph(self):
        """Save graph to disk"""
        with open(self.graph_file, 'w') as f:
            json.dump(self.entities, f, indent=2)
    
    def add_entity(self, name: str, entity_type: str = "ORG"):
        """Add or update an entity"""
        if name not in self.entities:
            self.entities[name] = {
                "type": entity_type,
                "relationships": {
                    "PARTNERS_WITH": [],
                    "COMPETES_WITH": [],
                    "SUPPLIES_TO": [],
                    "DEPENDS_ON": [],
                    "OWNS": [],
                    "INVESTED_IN": []
                },
                "sentiment_history": [],
                "mention_count": 0,
                "first_seen": "",
                "last_seen": ""
            }
        
        self.entities[name]["mention_count"] += 1
        self._save_graph()
    
    def add_relationship(self, entity1: str, entity2: str, relationship_type: str):
        """
        Add a relationship between two entities.
        
        Automatically adds reverse relationships:
        - PARTNERS_WITH is bidirectional
        - COMPETES_WITH is bidirectional
        - SUPPLIES_TO ↔ DEPENDS_ON
        - OWNS ↔ OWNED_BY
        """
        # Ensure both entities exist
        self.add_entity(entity1)
        self.add_entity(entity2)
        
        # Add forward relationship
        if entity2 not in self.entities[entity1]["relationships"][relationship_type]:
            self.entities[entity1]["relationships"][relationship_type].append(entity2)
        
        # Add reverse relationship
        if relationship_type == "PARTNERS_WITH":
            if entity1 not in self.entities[entity2]["relationships"]["PARTNERS_WITH"]:
                self.entities[entity2]["relationships"]["PARTNERS_WITH"].append(entity1)
        
        elif relationship_type == "COMPETES_WITH":
            if entity1 not in self.entities[entity2]["relationships"]["COMPETES_WITH"]:
                self.entities[entity2]["relationships"]["COMPETES_WITH"].append(entity1)
        
        elif relationship_type == "SUPPLIES_TO":
            if entity1 not in self.entities[entity2]["relationships"]["DEPENDS_ON"]:
                self.entities[entity2]["relationships"]["DEPENDS_ON"].append(entity1)
        
        elif relationship_type == "DEPENDS_ON":
            if entity1 not in self.entities[entity2]["relationships"]["SUPPLIES_TO"]:
                self.entities[entity2]["relationships"]["SUPPLIES_TO"].append(entity1)
        
        self._save_graph()
        logging.info(f"Relationship added: {entity1} {relationship_type} {entity2}")
    
    def get_impact_chain(self, entity: str, event_type: str = "POSITIVE") -> Dict:
        """
        Determines who else is affected when something happens to an entity.
        
        Example:
        - If Nvidia wins (POSITIVE) → Partners (Apple, Microsoft) also win
        - If TSMC fails (NEGATIVE) → Dependents (Apple, Nvidia) suffer
        """
        if entity not in self.entities:
            return {"winners": [], "losers": []}
        
        node = self.entities[entity]
        winners = []
        losers = []
        
        if event_type == "POSITIVE":
            # Partners benefit
            winners.extend([{
                "entity": e,
                "reason": f"Partner of {entity}",
                "relationship": "PARTNERS_WITH"
            } for e in node["relationships"]["PARTNERS_WITH"]])
            
            # Suppliers benefit (more orders)
            winners.extend([{
                "entity": e,
                "reason": f"Supplies to {entity}",
                "relationship": "SUPPLIES_TO"
            } for e in node["relationships"]["DEPENDS_ON"]])
            
            # Competitors lose
            losers.extend([{
                "entity": e,
                "reason": f"Competes with {entity}",
                "relationship": "COMPETES_WITH"
            } for e in node["relationships"]["COMPETES_WITH"]])
        
        elif event_type == "NEGATIVE":
            # Dependents suffer
            losers.extend([{
                "entity": e,
                "reason": f"Depends on {entity}",
                "relationship": "DEPENDS_ON"
            } for e in node["relationships"]["SUPPLIES_TO"]])
            
            # Partners suffer
            losers.extend([{
                "entity": e,
                "reason": f"Partner of {entity}",
                "relationship": "PARTNERS_WITH"
            } for e in node["relationships"]["PARTNERS_WITH"]])
            
            # Competitors benefit
            winners.extend([{
                "entity": e,
                "reason": f"Competes with {entity}",
                "relationship": "COMPETES_WITH"
            } for e in node["relationships"]["COMPETES_WITH"]])
        
        return {"winners": winners, "losers": losers}
    
    def detect_portfolio_conflicts(self, portfolio_entities: List[str], new_entity: str) -> List[Dict]:
        """
        Checks if adding a new entity creates conflicts with existing portfolio.
        
        Example:
        - Portfolio has Tesla → Adding BYD (competitor) = CONFLICT
        - Portfolio has Apple → Adding TSMC (supplier) = SYNERGY
        """
        if new_entity not in self.entities:
            return []
        
        conflicts = []
        new_node = self.entities[new_entity]
        
        for existing_entity in portfolio_entities:
            if existing_entity not in self.entities:
                continue
            
            # Check if they compete
            if existing_entity in new_node["relationships"]["COMPETES_WITH"]:
                conflicts.append({
                    "type": "CONFLICT",
                    "severity": "HIGH",
                    "message": f"{new_entity} competes with existing position {existing_entity}",
                    "recommendation": "Avoid - creates conflicting bets"
                })
            
            # Check if they're partners (synergy)
            if existing_entity in new_node["relationships"]["PARTNERS_WITH"]:
                conflicts.append({
                    "type": "SYNERGY",
                    "severity": "MEDIUM",
                    "message": f"{new_entity} partners with existing position {existing_entity}",
                    "recommendation": "Good - reinforces thesis"
                })
            
            # Check dependency
            if existing_entity in new_node["relationships"]["DEPENDS_ON"]:
                conflicts.append({
                    "type": "DEPENDENCY",
                    "severity": "MEDIUM",
                    "message": f"{new_entity} depends on existing position {existing_entity}",
                    "recommendation": "Caution - correlated risk"
                })
        
        return conflicts
    
    def get_entity_summary(self, entity: str) -> Dict:
        """Get summary of an entity"""
        if entity not in self.entities:
            return None
        
        return self.entities[entity]

if __name__ == "__main__":
    print("--- ENTITY GRAPH TEST ---")
    
    graph = EntityGraph()
    
    # Add relationships
    graph.add_relationship("Apple", "TSMC", "DEPENDS_ON")
    graph.add_relationship("Apple", "Nvidia", "PARTNERS_WITH")
    graph.add_relationship("Apple", "Samsung", "COMPETES_WITH")
    graph.add_relationship("Nvidia", "TSMC", "DEPENDS_ON")
    
    # Test impact chain
    print("\nIf Nvidia wins:")
    impact = graph.get_impact_chain("Nvidia", "POSITIVE")
    print(f"Winners: {impact['winners']}")
    print(f"Losers: {impact['losers']}")
    
    print("\nIf TSMC fails:")
    impact = graph.get_impact_chain("TSMC", "NEGATIVE")
    print(f"Winners: {impact['winners']}")
    print(f"Losers: {impact['losers']}")
    
    # Test portfolio conflicts
    print("\nPortfolio conflict check:")
    conflicts = graph.detect_portfolio_conflicts(["Apple"], "Samsung")
    for conflict in conflicts:
        print(f"{conflict['type']}: {conflict['message']}")
