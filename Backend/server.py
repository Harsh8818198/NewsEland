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
from data_ingestion import EntityExtractor, NewsScraper
from dotenv import load_dotenv

load_dotenv(override=True)

app = FastAPI(title="AI Investment Intelligence API", version="1.0")

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from the frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

memory = ContextMemory()

class ProfileUpdate(BaseModel):
    user_id: str
    risk_tolerance: str
    capital_available: float
    investment_horizon: str

# Initialize Brains
print("Initializing Brains...")
extractor = EntityExtractor()
scraper = NewsScraper()
analyzer = AnalysisEngine()
report_gen = SubReportGenerator(mock_mode=False)
decision_engine = DecisionEngine(mock_mode=False)
print("Brains Online.")

class AnalysisRequest(BaseModel):
    text: str

current_user = UserProfile("U1", "Conservative", 100000, "Long-term")

@app.get("/")
@app.get("/api/health")
def health_check():
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
    headline = request.text
    
    entities = extractor.extract_entities(headline)
    
    if not entities:
        raise HTTPException(status_code=400, detail="No entities found in the headline.")

    sentiment = analyzer.analyze_sentiment(headline)
    memory.update_memory(headline, entities, sentiment)

    return {
        "headline": headline,
        "entities": entities,
        "sentiment": sentiment,
        "message": "Analysis complete. Memory updated."
    }

@app.post("/api/refresh")
@app.post("/api/refresh-news")
def refresh_news():
    """
    Triggers the Scraper immediately.
    Supports both legacy /api/refresh-news and new Frontend /api/refresh.
    """
    articles = scraper.fetch_articles()
    new_stories = []
    
    for article in articles:
        entities = extractor.extract_entities(article['title'])
        analysis_result = analyzer.analyze_news(article, entities)
        story = memory.update_story(article, analysis_result, entities)
        new_stories.append(story['main_topic'])

    return {
        "status": "refreshed", 
        "success": True, # Frontend Expectation
        "articles_found": len(articles), 
        "updates": new_stories, 
        "new_stories": len(new_stories),  # Frontend Expectation
        "message": f"Refreshed {len(articles)} articles" # Frontend Expectation
    }

@app.post("/api/reset")
@app.post("/api/reset-memory")
def reset_memory():
    """
    Wipes the brain. Good for demos.
    Supports both legacy and new endpoints.
    """
    memory.reset()
    return {"status": "reset", "success": True, "message": "Memory initialized."}

@app.get("/api/status")
@app.get("/api/system/status")
def get_status():
    """
    System Health.
    """
    return {
        "status": "online",
        "brains": {
            "ingestion": "active",
            "analysis": "active",
            "memory": "connected"
        },
        "stories_tracked": len(memory.knowledge_graph.get('stories', {}))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
