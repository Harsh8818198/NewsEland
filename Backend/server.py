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
from data_ingestion import EntityExtractor, NewsScraper, ArticleContentFetcher
from cognitive_layer import CognitiveLayer
from entity_graph import EntityGraph
from dotenv import load_dotenv

# Import consolidated modules
from portfolio_risk import PortfolioManager, RiskEngine, ExitStrategyPlanner
from intelligence_layer import CompetitiveIntelligence, MacroContextEngine, MarketTimingEngine
from validation_learning import PatternValidator, SentimentTrendAnalyzer, BacktestEngine, FeedbackSystem

load_dotenv(override=True)

app = FastAPI(title="AI Investment Intelligence API", version="2.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Core Systems
memory = ContextMemory()
current_user = UserProfile("U1", "Conservative", 100000, "Long-term")

# Initialize Engines
print("Initializing Intelligence Systems...")
extractor = EntityExtractor()
scraper = NewsScraper()
content_fetcher = ArticleContentFetcher()
analyzer = AnalysisEngine()
report_gen = SubReportGenerator(mock_mode=False)
decision_engine = DecisionEngine(mock_mode=False)
cognitive = CognitiveLayer()
entity_graph = EntityGraph()

# Initialize New Systems
portfolio = PortfolioManager(current_user)
risk_engine = RiskEngine()
exit_planner = ExitStrategyPlanner()
competitive_intel = CompetitiveIntelligence(entity_graph)
macro_engine = MacroContextEngine()
market_timing = MarketTimingEngine()
pattern_validator = PatternValidator()
sentiment_analyzer = SentimentTrendAnalyzer()
backtest = BacktestEngine()
feedback = FeedbackSystem()

print("All Systems Online ✅")

# ============================================================================
# REQUEST MODELS
# ============================================================================

class ProfileUpdate(BaseModel):
    user_id: str
    risk_tolerance: str
    capital_available: float
    investment_horizon: str

class AnalysisRequest(BaseModel):
    text: str

class TradeRequest(BaseModel):
    ticker: str
    sector: str
    capital_allocation_pct: float
    entry_price: float

class ClosePositionRequest(BaseModel):
    ticker: str
    exit_price: float

class FeedbackRequest(BaseModel):
    story_id: str
    recommendation_id: str
    followed: bool
    result: str  # "SUCCESS" | "FAILURE" | "NEUTRAL"
    actual_return: float
    user_rating: int

# ============================================================================
# CORE ENDPOINTS (Original)
# ============================================================================

@app.get("/")
@app.get("/api/health")
def health_check():
    return {"status": "online", "message": "AI Investment Intelligence v2.0"}

@app.get("/api/stories")
def get_stories():
    """Returns all active stories with enhanced intelligence"""
    memory.knowledge_graph = memory._load_graph()
    
    active_stories = []
    for s_id, data in memory.knowledge_graph.get('stories', {}).items():
        if data.get('status') == 'ACTIVE':
            # Enhance story with real-world opportunities if available
            story_copy = data.copy()
            
            # Add sentiment trend analysis
            if len(data.get('events', [])) >= 3:
                trend = sentiment_analyzer.analyze_trend(data)
                story_copy['sentiment_trend'] = trend
            
            # Add pattern validation
            validation = pattern_validator.validate_pattern_consistency(data)
            story_copy['pattern_validation'] = validation
            
            active_stories.append(story_copy)
    
    return {"stories": sorted(active_stories, key=lambda x: x.get('maturity') in ['MATURE', 'ACTIONABLE'], reverse=True)}

@app.get("/api/profile")
def get_profile():
    return {
        "user_id": current_user.user_id,
        "risk_tolerance": current_user.risk_tolerance,
        "capital": current_user.capital_available,
        "horizon": current_user.investment_horizon,
        "description": current_user.get_risk_profile_description()
    }

@app.post("/api/profile")
def update_profile(profile: ProfileUpdate):
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
    return {
        "Conservative": "Wait for MATURE stories. Defensive allocation.",
        "Aggressive": "Buy DEVELOPING stories (Speculative). High allocation.",
        "Contrarian": "Bet against the Sentiment.",
        "logic_version": "2.0"
    }

@app.post("/api/analyze")
def analyze_headline(request: AnalysisRequest):
    headline = request.text
    entities = extractor.extract_entities(headline)
    
    if not entities:
        raise HTTPException(status_code=400, detail="No entities found")

    sentiment = analyzer.analyze_sentiment(headline)
    memory.update_memory(headline, entities, sentiment)

    return {
        "headline": headline,
        "entities": entities,
        "sentiment": sentiment,
        "message": "Analysis complete"
    }

@app.post("/api/refresh")
@app.post("/api/refresh-news")
def refresh_news():
    articles = scraper.fetch_articles()
    new_stories = []
    
    for article in articles:
        full_content = content_fetcher.fetch_content(article['url'])
        if full_content:
            article['content'] = full_content
        else:
            article['content'] = article['title']
        
        entities = extractor.extract_entities(article.get('content', article['title']))
        analysis_result = analyzer.analyze_news(article, entities)
        story = memory.update_story(article, analysis_result, entities)
        new_stories.append(story['main_topic'])

    return {
        "status": "refreshed",
        "success": True,
        "articles_found": len(articles),
        "new_stories": len(new_stories),
        "message": f"Refreshed {len(articles)} articles"
    }

@app.post("/api/reset")
@app.post("/api/reset-memory")
def reset_memory():
    memory.reset()
    return {"status": "reset", "success": True, "message": "Memory reset"}

@app.get("/api/status")
@app.get("/api/system/status")
def get_status():
    return {
        "status": "online",
        "brains": {
            "ingestion": "active",
            "analysis": "active",
            "memory": "connected",
            "portfolio": "active",
            "intelligence": "active"
        },
        "stories_tracked": len(memory.knowledge_graph.get('stories', {}))
    }

# ============================================================================
# NEW ENDPOINTS - PORTFOLIO & RISK MANAGEMENT
# ============================================================================

@app.get("/api/portfolio")
def get_portfolio():
    """Get current portfolio summary"""
    return portfolio.get_portfolio_summary()

@app.post("/api/portfolio/trade")
def execute_trade(request: TradeRequest):
    """Execute a trade"""
    try:
        recommendation = {
            "ticker": request.ticker,
            "sector": request.sector,
            "capital_allocation_pct": request.capital_allocation_pct
        }
        
        validation = portfolio.validate_allocation(recommendation)
        if not validation['approved']:
            raise HTTPException(status_code=400, detail=validation['reason'])
        
        portfolio.execute_trade(recommendation, request.entry_price)
        return {"success": True, "message": "Trade executed", "warnings": validation.get('warnings', [])}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio/close")
def close_position(request: ClosePositionRequest):
    """Close a position"""
    result = portfolio.close_position(request.ticker, request.exit_price)
    if result is None:
        raise HTTPException(status_code=404, detail="Position not found")
    return {"success": True, "pnl": result['pnl'], "pnl_pct": result['pnl_pct']}

@app.get("/api/risk/{story_id}")
def get_risk_assessment(story_id: str):
    """Get risk assessment for a story"""
    story = memory.knowledge_graph.get('stories', {}).get(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # Mock recommendation for risk assessment
    recommendation = {"capital_allocation_pct": 10.0}
    portfolio_summary = portfolio.get_portfolio_summary()
    
    assessment = risk_engine.assess_risk(story, recommendation, portfolio_summary)
    return assessment

@app.get("/api/exit-strategy/{story_id}")
def get_exit_strategy(story_id: str):
    """Get exit strategy for a story"""
    story = memory.knowledge_graph.get('stories', {}).get(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    conviction = story.get('thesis', {}).get('conviction_score', 0.5)
    entry_price = 100.0  # Would come from actual position
    
    strategy = exit_planner.create_exit_plan(entry_price, conviction, story.get('thesis', {}))
    return strategy

# ============================================================================
# NEW ENDPOINTS - INTELLIGENCE LAYER
# ============================================================================

@app.get("/api/competitive/{story_id}")
def get_competitive_analysis(story_id: str):
    """Get competitive intelligence for a story"""
    story = memory.knowledge_graph.get('stories', {}).get(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # Get cognitive reasoning (would be stored in story)
    cognitive_reasoning = story.get('cognitive', {})
    
    analysis = competitive_intel.analyze_competitive_landscape(story, cognitive_reasoning)
    return analysis

@app.get("/api/macro")
def get_macro_context():
    """Get current macro-economic context"""
    return macro_engine.get_current_regime()

@app.get("/api/timing/{story_id}")
def get_market_timing(story_id: str):
    """Get optimal market timing for entry"""
    story = memory.knowledge_graph.get('stories', {}).get(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    entities = story.get('entities', [])
    timing = market_timing.get_optimal_entry_window(story, entities)
    return timing

# ============================================================================
# NEW ENDPOINTS - VALIDATION & LEARNING
# ============================================================================

@app.get("/api/sentiment-trend/{story_id}")
def get_sentiment_trend(story_id: str):
    """Get sentiment trend analysis"""
    story = memory.knowledge_graph.get('stories', {}).get(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    trend = sentiment_analyzer.analyze_trend(story)
    return trend

@app.get("/api/pattern-validation/{story_id}")
def get_pattern_validation(story_id: str):
    """Validate pattern consistency"""
    story = memory.knowledge_graph.get('stories', {}).get(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    validation = pattern_validator.validate_pattern_consistency(story)
    return validation

@app.get("/api/backtest/report")
def get_backtest_report():
    """Get backtesting performance report"""
    return backtest.generate_performance_report()

@app.post("/api/feedback")
def submit_feedback(request: FeedbackRequest):
    """Submit user feedback on a recommendation"""
    outcome = {
        "followed": request.followed,
        "result": request.result,
        "actual_return": request.actual_return,
        "user_rating": request.user_rating
    }
    
    feedback.record_feedback(request.story_id, request.recommendation_id, outcome)
    return {"success": True, "message": "Feedback recorded"}

@app.get("/api/feedback/summary")
def get_feedback_summary():
    """Get feedback summary"""
    return feedback.get_feedback_summary()

# ============================================================================
# NEW ENDPOINTS - ENTITY GRAPH
# ============================================================================

@app.get("/api/entities/{entity_name}")
def get_entity_info(entity_name: str):
    """Get entity information from graph"""
    info = entity_graph.get_entity_summary(entity_name)
    if not info:
        raise HTTPException(status_code=404, detail="Entity not found")
    return info

@app.get("/api/impact/{entity_name}/{event_type}")
def get_impact_chain(entity_name: str, event_type: str):
    """Get impact chain for an entity event"""
    if event_type not in ["POSITIVE", "NEGATIVE"]:
        raise HTTPException(status_code=400, detail="event_type must be POSITIVE or NEGATIVE")
    
    impact = entity_graph.get_impact_chain(entity_name, event_type)
    return impact

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
