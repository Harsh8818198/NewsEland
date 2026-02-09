from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import logging
import json
import os
from datetime import datetime
from context_memory import ContextMemory
from user_profile import UserProfile
from analysis_engine import AnalysisEngine
from gemini_subreport import SubReportGenerator
from decision_engine import DecisionEngine
from data_ingestion import EntityExtractor, NewsScraper, ArticleContentFetcher
from cognitive_layer import CognitiveLayer
from entity_graph import EntityGraph
from deduplication_engine import DeduplicationEngine
from dotenv import load_dotenv
import os

# Import consolidated modules
from portfolio_risk import PortfolioManager, RiskEngine, ExitStrategyPlanner
from intelligence_layer import CompetitiveIntelligence, MacroContextEngine, MarketTimingEngine
from validation_learning import PatternValidator, SentimentTrendAnalyzer, BacktestEngine, FeedbackSystem
from analysis_storage import AnalysisStorage

load_dotenv(override=True)

app = FastAPI(title="AI Investment Intelligence API", version="2.0")

# CORS
# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://newseland.vercel.app", # Example Vercel URL
]

# Add frontend URL from env if present
if os.getenv("FRONTEND_URL"):
    origins.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
decision_engine = DecisionEngine(mock_mode=False, subreport_gen=report_gen)
cognitive = CognitiveLayer()
entity_graph = EntityGraph()
dedup = DeduplicationEngine()

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

# Initialize Analysis Storage
analysis_storage = AnalysisStorage()

# Initialize Dynamic Scraper
from dynamic_scraper import DynamicScraper
dynamic_scraper = DynamicScraper(scraper, analyzer, memory, extractor, content_fetcher)

# Signal handler for graceful shutdown
import signal
import sys
import os

def signal_handler(sig, frame):
    logging.warning("\n🛑 Ctrl+C detected - Stopping scraper immediately...")
    if dynamic_scraper.is_running:
        dynamic_scraper.stop()
    logging.info("✅ Scraper stopped. Server will continue running.")
    logging.info("Press Ctrl+C again to force shutdown.")
    
    # Remove the signal handler so next Ctrl+C will actually exit
    signal.signal(signal.SIGINT, signal.SIG_DFL)

signal.signal(signal.SIGINT, signal_handler)

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

class BatchAnalysisRequest(BaseModel):
    texts: List[str]

class TradeRequest(BaseModel):
    ticker: str
    sector: str
    capital_allocation_pct: float
    entry_price: float
    story_id: str = None # Link to story

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

@app.post("/api/stories/{story_id}/archive")
def archive_story(story_id: str):
    """Archive a completed story"""
    story = memory.knowledge_graph.get('stories', {}).get(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    story['status'] = 'ARCHIVED'
    memory._save_graph()
    return {"success": True, "message": "Story archived"}

@app.get("/api/stories/archived")
def get_archived_stories():
    """Get list of archived stories"""
    memory.knowledge_graph = memory._load_graph()
    archived = [s for s in memory.knowledge_graph.get('stories', {}).values() if s.get('status') == 'ARCHIVED']
    return {"stories": archived}

@app.post("/api/stories/{story_id}/thesis")
def update_thesis(story_id: str, thesis_update: dict):
    """Manually update the thesis or conviction"""
    story = memory.knowledge_graph.get('stories', {}).get(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # Update thesis fields if provided
    if 'conviction' in thesis_update:
        if not story.get('cognitive_analysis'): story['cognitive_analysis'] = {}
        story['cognitive_analysis']['conviction'] = thesis_update['conviction']
    
    if 'contrarian_angle' in thesis_update:
        if not story.get('cognitive_analysis'): story['cognitive_analysis'] = {}
        story['cognitive_analysis']['contrarian_angle'] = thesis_update['contrarian_angle']

    memory._save_graph()
    return {"success": True, "message": "Thesis updated", "story": story}

@app.get("/api/stories/{story_id}/subreport")
def get_story_subreport(story_id: str):
    """Get the latest subreport for a story"""
    story = memory.knowledge_graph.get('stories', {}).get(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # Try to get subreport from latest event
    if story.get('events'):
        latest_event = story['events'][-1]
        if latest_event.get('subreport'):
            return {"story_id": story_id, "subreport": latest_event['subreport']}
    
    # Fallback: Generate one on the fly if missing (e.g. old events)
    latest_event = story['events'][-1] if story.get('events') else {'title': story['main_topic'], 'sentiment': {}}
    subreport = report_gen.generate_sub_report(
        article=latest_event,
        analysis_result={'analysis': {'sentiment': latest_event.get('sentiment', {}), 'matched_patterns': [], 'second_order_effects': []}, 'entities': {}},
        story_context=story
    )
    return {"story_id": story_id, "subreport": subreport, "generated": "true"}



@app.get("/api/stories/{story_id}/cognitive")
def get_story_cognitive(story_id: str):
    """Get cognitive analysis for a story"""
    story = memory.knowledge_graph.get('stories', {}).get(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story.get('cognitive_analysis', {}) or {}

@app.get("/api/stories/{story_id}/opportunities")
def get_story_opportunities(story_id: str):
    """Get real-world opportunities for a story"""
    story = memory.knowledge_graph.get('stories', {}).get(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    cognitive = story.get('cognitive_analysis', {})
    return {"opportunities": cognitive.get('real_world_opportunities', [])}

@app.get("/api/stories/{story_id}/winners-losers")
def get_story_winners_losers(story_id: str):
    """Get winners and losers analysis for a story"""
    story = memory.knowledge_graph.get('stories', {}).get(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    cognitive = story.get('cognitive_analysis', {})
    return {
        "winners": cognitive.get('winners', []),
        "losers": cognitive.get('losers', [])
    }

@app.get("/api/entities/graph")
def get_entity_graph_data():
    """Get full entity graph data"""
    return entity_graph.entities

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
    # define article object
    article = {'title': headline, 'content': headline}
    
    entities = extractor.extract_entities(headline)
    
    if not entities:
        # Fallback if no entities found, still try to analyze
        entities = {'ORG': [], 'GPE': [], 'PRODUCT': []}

    # 1. Basic Analysis (Brain 3)
    analysis_result = analyzer.analyze_news(article, entities)
    
    # 2. Cognitive Analysis (Brain 2 - NEW)
    cognitive_insight = cognitive.reason_about_news(article, entities, analysis_result)
    
    # 3. Store in Memory
    # First, get the story context to see if it exists (for subreport generation)
    topic_id = memory.find_related_story(entities)
    story_context = memory.knowledge_graph['stories'].get(topic_id) if topic_id else None

    # Generate Sub-Report (Brain 3 Synthesis)
    subreport = report_gen.generate_sub_report(article, analysis_result, story_context)

    # Update Story with new event and subreport
    story = memory.update_story(article, analysis_result, entities, cognitive_analysis=cognitive_insight, subreport=subreport)

    # 4. Update Entity Graph
    for entity_type, entity_list in entities.items():
        for entity_name in entity_list:
            entity_graph.add_entity(entity_name, entity_type)

    # 5. Generate Strategic Advice via DecisionEngine
    advice = decision_engine.generate_advice(current_user, subreport, story)

    # Normalize sentiment for API consumers while keeping rich backend structure
    raw_sentiment = analysis_result['analysis']['sentiment']
    api_sentiment = {
        "score": raw_sentiment.get("sentiment_score", 0),
        "label": raw_sentiment.get("sentiment_label", "Neutral"),
    }

    return {
        "headline": headline,
        "entities": entities,
        "sentiment": api_sentiment,
        "cognitive_analysis": cognitive_insight,
        "story_id": story.get('id'),
        "advice": advice,
        "subreport": subreport,
        "story_context": {
            "topic": story.get('main_topic', 'Unknown'),
            "maturity": story.get('maturity', 'DEVELOPING'),
            "updates": story.get('updates_count', 1)
        },
        "user_profile": current_user.get_risk_profile_description(),
        "message": "Analysis complete with Cognitive Layer & Strategic Synthesis"
    }

@app.post("/api/analyze/batch")
def batch_analyze(request: BatchAnalysisRequest):
    """Analyze multiple headlines in batch"""
    results = []
    for text in request.texts:
        try:
            # Re-use existing analysis logic
            # Validating text length to avoid empty inputs
            if not text or len(text.strip()) < 5:
                continue
                
            logging.info(f"Batch processing: {text[:30]}...")
            result = analyze_headline(AnalysisRequest(text=text))
            results.append(result)
        except Exception as e:
            logging.error(f"Error processing batch item '{text[:20]}...': {e}")
            results.append({"error": str(e), "input": text, "status": "failed"})
            
    return {
        "status": "completed",
        "processed": len(results),
        "results": results
    }

@app.post("/api/refresh")
def refresh_news():
    articles = scraper.fetch_articles()
    new_stories = []
    
    for article in articles:
        # Deduplication Check
        is_dup = dedup.is_duplicate(article)
        if is_dup['is_duplicate']:
            logging.info(f"Skipping duplicate: {article['title']} ({is_dup['reason']})")
            continue
            
        full_content = content_fetcher.fetch_content(article['url'])
        if full_content:
            article['content'] = full_content
        else:
            article['content'] = article['title']
        
        entities = extractor.extract_entities(article.get('content', article['title']))
        analysis_result = analyzer.analyze_news(article, entities)
        
        # Cognitive Layer
        cognitive_insight = cognitive.reason_about_news(article, entities, analysis_result)
        
        # Sub-Report Generation
        topic_id = memory.find_related_story(entities)
        story_context = memory.knowledge_graph['stories'].get(topic_id) if topic_id else None
        subreport = report_gen.generate_sub_report(article, analysis_result, story_context)
        
        # Update Story
        story = memory.update_story(article, analysis_result, entities, cognitive_analysis=cognitive_insight, subreport=subreport)
        new_stories.append(story['main_topic'])
        
        # Update Entity Graph
        for entity_type, entity_list in entities.items():
            for entity_name in entity_list:
                entity_graph.add_entity(entity_name, entity_type)

        # Mark as processed in Dedup Engine
        dedup.mark_processed(article)

    return {
        "status": "refreshed",
        "success": True,
        "articles_found": len(articles),
        "new_stories": len(new_stories),
        "message": f"Refreshed {len(articles)} articles"
    }

@app.post("/api/reset")
def reset_memory():
    memory.reset()
    return {"status": "reset", "success": True, "message": "Memory reset"}

@app.get("/api/status")
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
        
        portfolio.execute_trade(recommendation, request.entry_price, request.story_id)
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

# ============================================================================
# ENHANCED PORTFOLIO ENDPOINTS - WAR ROOM
# ============================================================================

@app.get("/api/portfolio/enhanced")
def get_enhanced_portfolio():
    """Get portfolio with full story context and AI signals"""
    portfolio_summary = portfolio.get_portfolio_summary()
    positions = portfolio_summary.get('positions', [])
    
    # Enhance each position with story context and AI signals
    enhanced_positions = []
    for pos in positions:
        story_id = pos.get('story_id')
        enhanced_pos = pos.copy()
        
        if story_id:
            # Get story from memory
            story = memory.knowledge_graph.get('stories', {}).get(story_id)
            if story:
                # Add story context
                enhanced_pos['story_title'] = story.get('main_topic', 'Unknown Story')
                enhanced_pos['story_maturity'] = story.get('maturity', 'DEVELOPING')
                
                # Add current sentiment
                current_hyp = story.get('current_hypothesis', {})
                enhanced_pos['current_sentiment'] = {
                    'score': current_hyp.get('sentiment_score', 0),
                    'label': current_hyp.get('sentiment_label', 'Neutral'),
                    'trend': _calculate_sentiment_trend(story)
                }
                
                # Calculate AI signal
                enhanced_pos['ai_signal'] = _calculate_ai_signal(story, pos)
                enhanced_pos['risk_level'] = _calculate_risk_level(story, pos)
                enhanced_pos['last_story_update'] = story.get('last_update', '')
        else:
            # No story linked
            enhanced_pos['story_title'] = 'No Story Linked'
            enhanced_pos['story_maturity'] = 'UNKNOWN'
            enhanced_pos['current_sentiment'] = {'score': 0, 'label': 'Neutral', 'trend': 'STABLE'}
            enhanced_pos['ai_signal'] = 'WATCH'
            enhanced_pos['risk_level'] = 'MEDIUM'
        
        enhanced_positions.append(enhanced_pos)
    
    return {
        **portfolio_summary,
        'positions': enhanced_positions
    }

@app.get("/api/portfolio/signals")
def get_portfolio_signals():
    """Get AI signals for all positions"""
    portfolio_summary = portfolio.get_portfolio_summary()
    positions = portfolio_summary.get('positions', [])
    
    signals = []
    for pos in positions:
        story_id = pos.get('story_id')
        if story_id:
            story = memory.knowledge_graph.get('stories', {}).get(story_id)
            if story:
                signal = _calculate_ai_signal(story, pos)
                signals.append({
                    'ticker': pos.get('ticker'),
                    'signal': signal,
                    'confidence': _calculate_signal_confidence(story),
                    'reasoning': _get_signal_reasoning(story, signal)
                })
    
    return {'signals': signals}

@app.get("/api/portfolio/alerts")
def get_portfolio_alerts():
    """Get active alerts for portfolio positions"""
    portfolio_summary = portfolio.get_portfolio_summary()
    positions = portfolio_summary.get('positions', [])
    
    alerts = []
    alert_id = 0
    
    for pos in positions:
        story_id = pos.get('story_id')
        if not story_id:
            continue
            
        story = memory.knowledge_graph.get('stories', {}).get(story_id)
        if not story:
            continue
        
        ticker = pos.get('ticker', 'Unknown')
        
        # Check for sentiment changes
        current_hyp = story.get('current_hypothesis', {})
        previous_hyp = story.get('previous_hypothesis', {})
        
        if current_hyp and previous_hyp:
            current_sentiment = current_hyp.get('sentiment_label', 'Neutral')
            previous_sentiment = previous_hyp.get('sentiment_label', 'Neutral')
            
            if current_sentiment != previous_sentiment:
                alerts.append({
                    'id': f'alert_{alert_id}',
                    'ticker': ticker,
                    'type': 'SENTIMENT_CHANGE',
                    'severity': 'WARNING' if current_sentiment == 'Bearish' else 'INFO',
                    'message': f'{ticker}: Sentiment changed from {previous_sentiment} to {current_sentiment}',
                    'story_id': story_id,
                    'timestamp': story.get('last_update', datetime.now().isoformat()),
                    'action_required': current_sentiment == 'Bearish'
                })
                alert_id += 1
        
        # Check for high risk
        risk_level = _calculate_risk_level(story, pos)
        if risk_level == 'HIGH':
            alerts.append({
                'id': f'alert_{alert_id}',
                'ticker': ticker,
                'type': 'RISK_INCREASE',
                'severity': 'CRITICAL',
                'message': f'{ticker}: Risk level elevated to HIGH',
                'story_id': story_id,
                'timestamp': datetime.now().isoformat(),
                'action_required': True
            })
            alert_id += 1
        
        # Check for exit signals
        ai_signal = _calculate_ai_signal(story, pos)
        if ai_signal == 'EXIT':
            alerts.append({
                'id': f'alert_{alert_id}',
                'ticker': ticker,
                'type': 'EXIT_SIGNAL',
                'severity': 'CRITICAL',
                'message': f'{ticker}: AI recommends EXIT',
                'story_id': story_id,
                'timestamp': datetime.now().isoformat(),
                'action_required': True
            })
            alert_id += 1
    
    return {'alerts': alerts, 'count': len(alerts)}

@app.get("/api/portfolio/opportunities")
def get_investment_opportunities():
    """Get actionable stories not yet invested in"""
    stories = memory.knowledge_graph.get('stories', {})
    portfolio_summary = portfolio.get_portfolio_summary()
    invested_story_ids = set()
    
    # Get story IDs we're already invested in
    for pos in portfolio_summary.get('positions', []):
        story_id = pos.get('story_id')
        if story_id:
            invested_story_ids.add(story_id)
    
    opportunities = []
    
    for story_id, story in stories.items():
        # Skip if already invested
        if story_id in invested_story_ids:
            continue
        
        # Only include ACTIONABLE stories
        if story.get('maturity') != 'ACTIONABLE':
            continue
        
        # Skip inactive stories
        if story.get('status') != 'ACTIVE':
            continue
        
        current_hyp = story.get('current_hypothesis', {})
        cognitive = story.get('cognitive', {})
        
        # Calculate confidence score
        conviction = cognitive.get('conviction', 0.5)
        sentiment_score = abs(current_hyp.get('sentiment_score', 0))
        confidence = (conviction + sentiment_score) / 2
        
        # Get suggested ticker from cognitive analysis
        winners = cognitive.get('winners', [])
        suggested_ticker = winners[0].get('ticker') if winners else 'TBD'
        
        opportunities.append({
            'story_id': story_id,
            'story_title': story.get('main_topic', 'Unknown'),
            'maturity': story.get('maturity'),
            'sentiment': {
                'score': current_hyp.get('sentiment_score', 0),
                'label': current_hyp.get('sentiment_label', 'Neutral')
            },
            'confidence': round(confidence * 100, 1),
            'suggested_ticker': suggested_ticker,
            'suggested_allocation_pct': 10.0,  # Default 10%
            'reasoning': current_hyp.get('expected_impact', 'No reasoning available')
        })
    
    # Sort by confidence (highest first)
    opportunities.sort(key=lambda x: x['confidence'], reverse=True)
    
    return {'opportunities': opportunities[:10], 'count': len(opportunities)}  # Top 10

# Helper functions for portfolio intelligence
def _calculate_sentiment_trend(story):
    """Calculate sentiment trend (IMPROVING/DECLINING/STABLE)"""
    current_hyp = story.get('current_hypothesis', {})
    previous_hyp = story.get('previous_hypothesis', {})
    
    if not previous_hyp:
        return 'STABLE'
    
    current_score = current_hyp.get('sentiment_score', 0)
    previous_score = previous_hyp.get('sentiment_score', 0)
    
    diff = current_score - previous_score
    
    if diff > 0.1:
        return 'IMPROVING'
    elif diff < -0.1:
        return 'DECLINING'
    else:
        return 'STABLE'

def _calculate_ai_signal(story, position):
    """Calculate AI signal: BUY, HOLD, EXIT, WATCH"""
    maturity = story.get('maturity', 'DEVELOPING')
    current_hyp = story.get('current_hypothesis', {})
    sentiment_label = current_hyp.get('sentiment_label', 'Neutral')
    sentiment_score = current_hyp.get('sentiment_score', 0)
    
    # Get P&L
    pnl_pct = position.get('pnl_pct', 0)
    
    # EXIT conditions
    if sentiment_label == 'Bearish' and maturity == 'ACTIONABLE':
        return 'EXIT'
    if pnl_pct < -15:  # Stop loss at -15%
        return 'EXIT'
    
    # BUY conditions (add to position)
    if sentiment_label == 'Bullish' and maturity == 'ACTIONABLE' and sentiment_score > 0.7:
        return 'BUY'
    
    # HOLD conditions
    if sentiment_label == 'Bullish' or (sentiment_label == 'Neutral' and pnl_pct > 0):
        return 'HOLD'
    
    # Default to WATCH
    return 'WATCH'

def _calculate_risk_level(story, position):
    """Calculate risk level: LOW, MEDIUM, HIGH"""
    current_hyp = story.get('current_hypothesis', {})
    sentiment_label = current_hyp.get('sentiment_label', 'Neutral')
    pnl_pct = position.get('pnl_pct', 0)
    
    # HIGH risk
    if sentiment_label == 'Bearish':
        return 'HIGH'
    if pnl_pct < -10:
        return 'HIGH'
    
    # LOW risk
    if sentiment_label == 'Bullish' and pnl_pct > 10:
        return 'LOW'
    
    # MEDIUM risk (default)
    return 'MEDIUM'

def _calculate_signal_confidence(story):
    """Calculate confidence in AI signal (0-100)"""
    cognitive = story.get('cognitive', {})
    conviction = cognitive.get('conviction', 0.5)
    maturity = story.get('maturity', 'DEVELOPING')
    
    # Higher confidence for ACTIONABLE stories
    maturity_bonus = 0.2 if maturity == 'ACTIONABLE' else 0
    
    confidence = (conviction + maturity_bonus) * 100
    return min(100, round(confidence, 1))

def _get_signal_reasoning(story, signal):
    """Get reasoning for AI signal"""
    current_hyp = story.get('current_hypothesis', {})
    sentiment_label = current_hyp.get('sentiment_label', 'Neutral')
    maturity = story.get('maturity', 'DEVELOPING')
    
    if signal == 'EXIT':
        return f"Bearish sentiment detected with {maturity} maturity. Consider exiting position."
    elif signal == 'BUY':
        return f"Strong bullish signal with {maturity} maturity. Consider adding to position."
    elif signal == 'HOLD':
        return f"{sentiment_label} sentiment with {maturity} maturity. Maintain current position."
    else:
        return f"Neutral signal. Monitor story developments."



# ============================================================================
# DYNAMIC SCRAPER CONTROL ENDPOINTS
# ============================================================================

class ScraperConfigUpdate(BaseModel):
    interval_minutes: int = None
    runtime_hours: int = None
    runtime_minutes: int = None
    auto_start: bool = None

@app.post("/api/scraper/start")
def start_dynamic_scraper():
    """Start the dynamic news scraper"""
    result = dynamic_scraper.start()
    return result

@app.post("/api/scraper/stop")
def stop_dynamic_scraper():
    """Stop the dynamic news scraper"""
    result = dynamic_scraper.stop()
    return result

@app.get("/api/scraper/status")
def get_scraper_status():
    """Get current scraper status and configuration"""
    return dynamic_scraper.get_status()

@app.post("/api/scraper/config")
def update_scraper_config(config: ScraperConfigUpdate):
    """
    Update scraper configuration
    
    Parameters:
    - interval_minutes: How often to scrape (minimum 1 minute)
    - runtime_hours: How long to run in hours (0 = indefinitely)
    - runtime_minutes: Additional minutes to run (0-59)
    - auto_start: Whether to auto-start on server startup
    """
    try:
        logging.info(f"Received config update request: interval={config.interval_minutes}, hours={config.runtime_hours}, minutes={config.runtime_minutes}, auto_start={config.auto_start}")
        
        dynamic_scraper.update_config(
            interval_minutes=config.interval_minutes,
            runtime_hours=config.runtime_hours,
            runtime_minutes=config.runtime_minutes,
            auto_start=config.auto_start
        )
        return {
            "success": True,
            "message": "Configuration updated",
            "config": dynamic_scraper.config
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/scraper/stats")
def get_scraper_stats():
    """Get scraper statistics"""
    return dynamic_scraper.get_stats()

# ============================================================================
# ANALYSIS ENDPOINTS
# ============================================================================

@app.post("/api/stories/{story_id}/analyze")
def analyze_story(story_id: str):
    """
    Trigger comprehensive analysis of a story and store results
    Runs all analysis engines and saves to persistent storage
    """
    try:
        import traceback
        logging.info(f"Starting analysis for story: {story_id}")
        
        # Get story from memory
        stories = memory.get_all_stories()
        story = next((s for s in stories if s.get('id') == story_id), None)
        
        if not story:
            logging.error(f"Story not found: {story_id}")
            raise HTTPException(status_code=404, detail="Story not found")
        
        # Get first event for analysis
        events = story.get('events', [])
        if not events:
            logging.error(f"Story has no events: {story_id}")
            raise HTTPException(status_code=400, detail="Story has no events to analyze")
        
        first_event = events[0]
        article = {
            'title': first_event.get('title', story.get('main_topic', '')),
            'content': first_event.get('content', story.get('summary', ''))
        }
        
        logging.info(f"Analyzing article: {article['title']}")

        # Extract entities
        entities = extractor.extract_entities(article['title'] + ' ' + str(article['content']))
        if not entities:
            entities = {'ORG': [], 'GPE': [], 'PRODUCT': []}
        
        # Run comprehensive analysis
        logging.info(f"Running sentiment analysis...")
        
        # 1. Basic sentiment analysis
        sentiment_analysis = analyzer.analyze_news(article, entities)
        logging.info("Sentiment analysis done")
        
        # 2. Cognitive reasoning
        logging.info("Running cognitive reasoning...")
        cognitive_analysis = cognitive.reason_about_news(article, entities, sentiment_analysis)
        logging.info("Cognitive reasoning done")
        
        # 3. Competitive intelligence
        logging.info("Running competitive intel...")
        intelligence = competitive_intel.analyze_competitive_landscape(story, cognitive_analysis)
        logging.info("Competitive intel done")
        
        # 4. Risk assessment
        logging.info("Running risk assessment...")
        portfolio_summary = portfolio.get_portfolio_summary()
        risk_assessment = risk_engine.assess_risk(story, cognitive_analysis, portfolio_summary)
        logging.info("Risk assessment done")
        
        # 5. Exit strategy
        logging.info("Running exit strategy...")
        exit_strategy = exit_planner.plan_exit(story, cognitive_analysis, risk_assessment)
        logging.info("Exit strategy done")
        
        # Compile complete analysis
        complete_analysis = {
            "sentiment": sentiment_analysis,
            "cognitive": cognitive_analysis,
            "intelligence": intelligence,
            "risk": risk_assessment,
            "exit_strategy": exit_strategy,
            "analyzed_at": datetime.now().isoformat(),
            "story_title": story.get('main_topic', 'Unknown Story')
        }
        
        # Save to storage
        logging.info("Saving analysis...")
        success = analysis_storage.save_analysis(
            story_id=story_id,
            story_title=story.get('main_topic', 'Unknown'),
            analysis=complete_analysis
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save analysis")
        
        logging.info(f"Analysis completed and saved for story: {story_id}")
        
        return {
            "success": True,
            "story_id": story_id,
            "analysis": complete_analysis
        }
    
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Analysis failed: {str(e)}\n{traceback.format_exc()}"
        logging.error(error_msg)
        with open("last_error.txt", "w") as f:
            f.write(error_msg)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/analyses")
def list_analyses(limit: int = 50):
    """
    Get list of all stored analyses
    Returns summary information for each analysis
    """
    try:
        analyses = analysis_storage.list_analyses(limit=limit)
        return {
            "success": True,
            "count": len(analyses),
            "analyses": analyses
        }
    except Exception as e:
        logging.error(f"Failed to list analyses: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stories/{story_id}/analysis")
def get_story_analysis(story_id: str):
    """
    Get stored analysis for a specific story
    Returns None if no analysis exists
    """
    try:
        analysis = analysis_storage.get_analysis(story_id)
        
        if not analysis:
            return {
                "success": True,
                "exists": False,
                "analysis": None
            }
        
        return {
            "success": True,
            "exists": True,
            "analysis": analysis
        }
    except Exception as e:
        logging.error(f"Failed to get analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/stories/{story_id}/analysis/notes")
def update_analysis_notes(story_id: str, notes: dict):
    """
    Update user notes for an existing analysis
    """
    try:
        user_notes = notes.get("notes", "")
        success = analysis_storage.update_notes(story_id, user_notes)
        
        if not success:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        return {
            "success": True,
            "message": "Notes updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to update notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# SERVER STARTUP
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
