from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import json
from context_memory import ContextMemory
from user_profile import UserProfile
from analysis_engine import AnalysisEngine
from gemini_subreport import SubReportGenerator
from decision_engine import DecisionEngine
from data_ingestion import EntityExtractor
from dotenv import load_dotenv

load_dotenv(override=True)

app = FastAPI(title="AI Investment Intelligence API", version="1.0")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

memory = ContextMemory()

class ProfileUpdate(BaseModel):
    user_id: str
    risk_tolerance: str
    capital_available: float
extractor = EntityExtractor()
analyzer = AnalysisEngine()
report_gen = SubReportGenerator(mock_mode=False)
decision_engine = DecisionEngine(mock_mode=False)

class AnalysisRequest(BaseModel):
    text: str

class ProfileUpdate(BaseModel):
    user_id: str
    risk_tolerance: str
    capital_available: float
    investment_horizon: str

current_user = UserProfile("U1", "Conservative", 100000, "Long-term")

@app.get("/")
def health_check():
    return {"status": "online", "message": "AI Financial Guide is active."}

@app.get("/api/health")
def api_health():
    """API health check endpoint"""
    return {"status": "online", "message": "AI Financial Guide is active."}

@app.get("/api/stories")
def get_stories():
    """
    Returns the Knowledge Graph (The Narrative Memory).
    Frontend uses this to show the "Story Cards".
    """
    memory.knowledge_graph = memory._load_graph()
    
    active_stories = []
    for s_id, data in memory.knowledge_graph.get('stories', {}).items():
        if data.get('status') == 'ACTIVE':
            # Generate a subreport for each story if it has events
            if len(data.get('events', [])) > 0:
                latest_event = data['events'][-1]
                article = {'title': latest_event['title'], 'source': 'Knowledge Graph'}
                
                # Create a minimal analysis result for the report
                analysis_result = {
                    'analysis': {
                        'sentiment': latest_event.get('sentiment', {}),
                        'matched_patterns': [{'pattern_name': latest_event.get('pattern', 'General Market'), 'historical_outcome': 'Market movement', 'example': 'Historical precedent'}],
                        'second_order_effects': ['Monitor related sectors', 'Watch for regulatory response']
                    },
                    'entities': data.get('entities', [])
                }
                
                # Generate subreport
                try:
                    subreport = report_gen.generate_report(article, analysis_result, story_context=data)
                    data['subreport'] = subreport
                except Exception as e:
                    logging.error(f"Failed to generate subreport for {s_id}: {e}")
                    data['subreport'] = None
            
            active_stories.append(data)
    
    return {"stories": sorted(active_stories, key=lambda x: x.get('maturity') == 'MATURE', reverse=True)}

@app.get("/api/profile")
def get_profile():
    """
    Returns the current User Persona.
    """
    return {
        "user_id": current_user.user_id,
        "risk_tolerance": current_user.risk_tolerance,
        "capital": current_user.capital_available,
        "horizon": current_user.investment_horizon,
        "description": current_user.get_risk_profile_description()
    }

@app.post("/api/profile")
def update_profile(profile: ProfileUpdate):
    """
    Updates the User Persona (e.g., Switching from Conservative to Aggressive).
    """
    global current_user
    current_user = UserProfile(
        user_id=profile.user_id,
        risk_tolerance=profile.risk_tolerance,
        capital_available=profile.capital_available,
        investment_horizon=profile.investment_horizon
    )
    return {"status": "updated", "profile": get_profile()}

@app.get("/api/decision-logic")
def get_decision_logic():
    """
    Helper for Frontend to understand why a decision was made.
    """
    return {
        "Conservative": "Wait for MATURE stories. Defensive allocation.",
        "Aggressive": "Buy DEVELOPING stories (Speculative). High allocation.",
        "Contrarian": "Bet against the Sentiment.",
        "logic_version": "2.0"
    }

@app.post("/api/analyze")
def analyze_headline(request: AnalysisRequest):
    """
    Exposes the "Interactive Mode" to the Frontend.
    1. Extracts Entities (Brain 1)
    2. Analyzes Sentiment/Patterns (Brain 3)
    3. Updates Memory (Hippocampus)
    4. Generates Device (Brain 2)
    """
    try:
        headline = request.text
        
        entities_dict = extractor.extract_entities(headline)
        # Ensure entities_dict is a dictionary
        if not isinstance(entities_dict, dict):
            entities_dict = {"ORG": [], "GPE": [], "PRODUCT": [], "PERSON": []}
        
        article = {'title': headline, 'source': 'Web API Input'}
        analysis_result = analyzer.analyze_news(article, entities_dict)
        
        story = memory.update_story(article, analysis_result, entities_dict)
        
        sub_report = report_gen.generate_report(article, analysis_result, story_context=story)
        advice = decision_engine.generate_advice(current_user, sub_report, story_context=story)
        
        # Convert entities dict to flat list for API response
        entities_list = []
        if isinstance(entities_dict, dict):
            for entity_type, entity_values in entities_dict.items():
                if isinstance(entity_values, list):
                    entities_list.extend(entity_values)
        
        return {
            "analysis": analysis_result.get('analysis', {'text': headline, 'sentiment': 'neutral', 'sentiment_score': 0.5}),
            "entities": entities_list,
            "story_context": {
                "topic": story['main_topic'],
                "maturity": story['maturity'],
                "updates": story['updates_count']
            },
            "advice": advice,
            "user_profile": current_user.risk_tolerance
        }
    except Exception as e:
        logging.error(f"Analyze endpoint error: {str(e)}")
        return {
            "analysis": {'text': request.text if 'request' in locals() else '', 'sentiment': {'sentiment_label': 'Neutral', 'sentiment_score': 0.5}, 'error': str(e)},
            "entities": [],
            "story_context": {"topic": "Unknown", "maturity": "Developing", "updates": 0},
            "advice": f"Analysis failed: {str(e)}",
            "user_profile": "moderate"
        }

from data_ingestion import EntityExtractor, NewsScraper

extractor = EntityExtractor()
scraper = NewsScraper()
analyzer = AnalysisEngine()
report_gen = SubReportGenerator(mock_mode=False)
decision_engine = DecisionEngine(mock_mode=False)


@app.post("/api/refresh-news")
def refresh_news():
    """
    Triggers the Scraper immediately.
    """
    articles = scraper.fetch_articles()
    new_stories = []
    
    for article in articles:
        
        entities = extractor.extract_entities(article['title'])
        analysis_result = analyzer.analyze_news(article, entities)
        story = memory.update_story(article, analysis_result, entities)
        new_stories.append(story['main_topic'])

    return {"success": True, "message": f"Refreshed {len(articles)} articles", "new_stories": len(articles), "updated_stories": 0}

@app.post("/api/reset-memory")
def reset_memory():
    """
    Wipes the brain. Good for demos.
    """
    memory.reset()
    return {"success": True, "message": "Memory initialized."}

@app.post("/api/refresh")
def refresh_endpoint():
    """Alias endpoint for /api/refresh-news"""
    return refresh_news()

@app.post("/api/reset")
def reset_endpoint():
    """Alias endpoint for /api/reset-memory"""
    return reset_memory()

@app.get("/api/status")
def get_status():
    """
    System Health.
    """
    memory.knowledge_graph = memory._load_graph()
    stories = memory.knowledge_graph.get('stories', {})
    
    return {
        "status": "online",
        "brains": {
            "ingestion": "active",
            "analysis": "active",
            "memory": "connected"
        },
        "stories_tracked": len(stories)
    }

@app.get("/api/system/status")
def get_system_status():
    """
    System Health Status endpoint for frontend.
    Returns ingestion, analysis, and memory components status.
    """
    memory.knowledge_graph = memory._load_graph()
    stories = memory.knowledge_graph.get('stories', {})
    
    return {
        "brains": {
            "ingestion": "healthy",
            "analysis": "healthy",
            "memory": "healthy"
        },
        "stories_tracked": len(stories)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
