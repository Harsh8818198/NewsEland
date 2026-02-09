# AI Investment Intelligence System - Complete Process Flow

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DATA INGESTION LAYER                             │
│  News Sources → Scraper → Deduplication → Full Content Fetch        │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    ANALYSIS & INTELLIGENCE LAYER                     │
│  Entity Extraction → Sentiment → Cognitive Reasoning → Maturity     │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    INTELLIGENCE ENHANCEMENT LAYER                    │
│  Competitive Intel → Macro Context → Market Timing → Risk           │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    DECISION & EXECUTION LAYER                        │
│  Decision Engine → Portfolio Validation → Exit Strategy → Execute   │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    LEARNING & VALIDATION LAYER                       │
│  Pattern Validation → Sentiment Trends → Backtesting → Feedback     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Complete Process Breakdown (15 Stages)

### **STAGE 1: News Ingestion**
**File**: `data_ingestion.py` → `NewsScraper`

**Process**:
1. Scrapes news from configured sources (NewsAPI, RSS feeds)
2. Extracts: title, description, URL, published date, source
3. Returns list of raw articles

**Output**:
```python
{
    "title": "Tesla raises $5B in new funding",
    "url": "https://...",
    "published_at": "2024-02-07T10:00:00Z",
    "source": "Reuters"
}
```

**Trigger**: 
- Manual: `POST /api/refresh`
- Automated: `autonomous_monitor.py` (scheduled)

---

### **STAGE 2: Deduplication Check**
**File**: `deduplication_engine.py` → `DeduplicationEngine`

**Process**:
1. **URL Check**: Exact URL match against cache
2. **Content Hash**: Fuzzy duplicate detection (90% similarity)
3. **Title Similarity**: Catches rewrites of same story
4. **Cache**: 7-day rolling window

**Decision**:
- ✅ **New Article** → Proceed to Stage 3
- ❌ **Duplicate** → Skip processing

**Why Critical**: Prevents wasting API calls and duplicate story updates

---

### **STAGE 3: Full Content Extraction**
**File**: `data_ingestion.py` → `ArticleContentFetcher`

**Process**:
1. Fetches full article HTML from URL
2. Uses `newspaper3k` to extract clean text
3. Fallback to title+description if fetch fails

**Output**:
```python
article['content'] = "Full article text (2000+ words)..."
```

**Why Critical**: AI needs full context, not just headlines

---

### **STAGE 4: Entity Extraction**
**File**: `data_ingestion.py` → `EntityExtractor`

**Process**:
1. Uses **spaCy NER** (Named Entity Recognition)
2. Extracts: Organizations, People, Products, Locations
3. Filters noise (common words, irrelevant entities)

**Output**:
```python
entities = ["Tesla", "Elon Musk", "SEC", "Model 3"]
```

**Why Critical**: Identifies WHO/WHAT the story is about

---

### **STAGE 5: Sentiment Analysis**
**File**: `analysis_engine.py` → `AnalysisEngine.analyze_sentiment()`

**Process**:
1. **Gemini AI** analyzes article content
2. Determines: Bullish/Bearish/Neutral
3. Assigns sentiment score (-1 to +1)
4. Identifies key event type (e.g., "Capital Injection", "Regulatory Risk")

**Output**:
```python
{
    "sentiment_label": "Bullish",
    "sentiment_score": 0.75,
    "key_event_type": "Capital Injection",
    "why": "Funding enables expansion",
    "what": "Tesla raised $5B",
    "how": "Equity offering",
    "expected_impact": "Accelerated growth"
}
```

---

### **STAGE 6: Cognitive Reasoning (So What?)**
**File**: `cognitive_layer.py` → `CognitiveLayer.reason_about_news()`

**Process**:
1. **Deep Analysis**: "Why does this matter?"
2. **Winner/Loser Identification**: Who benefits? Who suffers?
3. **Unsaid Implications**: What's between the lines?
4. **Next Moves**: What will happen next?
5. **Conviction Score**: 0-10 confidence
6. **Contrarian Angle**: What's the opposite view?
7. **🌍 Real-World Opportunities**: Commodity/Real Estate/Consumer plays

**Output**:
```python
{
    "so_what": "Tesla securing $5B signals aggressive expansion into new markets",
    "winners": [
        {"entity": "Tesla suppliers", "reason": "More orders incoming"},
        {"entity": "Battery manufacturers", "reason": "Increased demand"}
    ],
    "losers": [
        {"entity": "Traditional automakers", "reason": "Losing competitive edge"}
    ],
    "unsaid": "This may trigger price war in EV market",
    "next_moves": ["Factory expansion announcement", "New model launch"],
    "conviction": 8,
    "contrarian_angle": "Dilution may hurt existing shareholders",
    "real_world_opportunities": [
        {
            "type": "COMMODITY",
            "item": "Lithium",
            "action": "Buy lithium ETF NOW",
            "timing": "URGENT",
            "investment": "$5000",
            "expected_savings": "$2000",
            "reasoning": "EV demand will spike lithium prices 40% in 3 months"
        }
    ]
}
```

---

### **STAGE 7: Story Matching & Update**
**File**: `context_memory.py` → `ContextMemory.update_story()`

**Process**:
1. **Entity Matching**: Find existing stories with same entities
2. **Topic Similarity**: Check if this is a continuation
3. **Decision**:
   - ✅ **Match Found** → Add as new event to existing story
   - ❌ **No Match** → Create new story

**Story Structure**:
```python
{
    "id": "story_001",
    "main_topic": "Tesla Expansion Strategy",
    "entities": ["Tesla", "Elon Musk"],
    "maturity": "DEVELOPING",
    "status": "ACTIVE",
    "updates_count": 3,
    "events": [
        {
            "date": "2024-02-01",
            "title": "Tesla announces new factory",
            "sentiment": {...},
            "pattern": "Market Expansion"
        },
        {
            "date": "2024-02-07",
            "title": "Tesla raises $5B",
            "sentiment": {...},
            "pattern": "Capital Injection"
        }
    ],
    "thesis": {
        "core_belief": "Tesla is preparing for aggressive global expansion",
        "conviction_score": 0.85,
        "thesis_status": "STRENGTHENING"
    }
}
```

---

### **STAGE 8: Maturity Assessment**
**File**: `maturity_engine.py` → `MaturityEngine.assess_maturity()`

**Process**:
1. **Event Count**: How many updates?
2. **Time Span**: How long has story been developing?
3. **Pattern Consistency**: Same theme or changing?
4. **Sentiment Stability**: Consistent or volatile?

**Maturity Levels**:
- **DEVELOPING** (1-2 events): Too early, speculative
- **ACTIONABLE** (3-5 events): Thesis forming, tradeable
- **MATURE** (6+ events): Well-established, lower risk

**Output**:
```python
{
    "maturity": "ACTIONABLE",
    "confidence": 0.85,
    "reasoning": "3 consistent events over 7 days, clear pattern emerging"
}
```

---

### **STAGE 9: Thesis Update**
**File**: `cognitive_layer.py` → `CognitiveLayer.update_thesis()`

**Process**:
1. Reviews previous thesis
2. Incorporates new cognitive reasoning
3. Updates conviction score
4. Determines thesis status

**Thesis Statuses**:
- **FORMING**: Initial hypothesis
- **STRENGTHENING**: New evidence supports thesis
- **WEAKENING**: Contradictory evidence
- **INVALIDATED**: Thesis proven wrong

**Output**:
```python
{
    "core_belief": "Tesla is preparing for aggressive global expansion",
    "conviction_score": 0.85,
    "thesis_status": "STRENGTHENING",
    "supporting_evidence": ["$5B raise", "Factory announcement", "Hiring surge"],
    "contradicting_evidence": []
}
```

---

### **STAGE 10: Opportunity Detection**
**File**: `cognitive_layer.py` → `CognitiveLayer.detect_opportunity_type()`

**Process**:
1. Analyzes cognitive reasoning + thesis
2. Identifies opportunity type
3. Calculates expected return

**Opportunity Types**:
- **ASYMMETRIC_UPSIDE**: High reward, low risk
- **CONTRARIAN_PLAY**: Bet against consensus
- **MOMENTUM_PLAY**: Ride the trend
- **VALUE_TRAP**: Looks cheap but risky
- **NO_OPPORTUNITY**: Pass

**Output**:
```python
{
    "is_opportunity": True,
    "opportunity_type": "ASYMMETRIC_UPSIDE",
    "expected_return": "25-50%",
    "reasoning": "Market hasn't priced in expansion potential"
}
```

---

### **STAGE 11: Competitive Intelligence**
**File**: `intelligence_layer.py` → `CompetitiveIntelligence.analyze_competitive_landscape()`

**Process**:
1. **Gemini AI** analyzes competitive dynamics
2. Identifies main competitors
3. Assesses competitive position (STRONG/NEUTRAL/WEAK)
4. Detects threats and advantages
5. Determines market share trend

**Output**:
```python
{
    "competitive_position": "STRONG",
    "main_competitors": [
        {"name": "BYD", "threat_level": "HIGH", "reason": "Growing fast in China"},
        {"name": "Rivian", "threat_level": "MEDIUM", "reason": "Niche player"}
    ],
    "competitive_threats": ["BYD's lower prices", "Traditional OEMs entering EV"],
    "competitive_advantages": ["Brand strength", "Supercharger network", "FSD technology"],
    "market_share_trend": "GAINING"
}
```

---

### **STAGE 12: Macro Context Check**
**File**: `intelligence_layer.py` → `MacroContextEngine.get_current_regime()`

**Process**:
1. **Gemini AI** assesses current market conditions
2. Determines market regime (BULL/BEAR/SIDEWAYS)
3. Checks VIX (volatility)
4. Analyzes Fed policy
5. Estimates recession probability

**Output**:
```python
{
    "market_regime": "BULL",
    "vix": 18,
    "fed_policy": "NEUTRAL",
    "recession_probability": 0.25,
    "sector_rotation": "Technology and AI stocks leading",
    "risk_level": "MEDIUM"
}
```

**Adjustment Logic**:
- **BEAR market** → Downgrade BUY to WATCHLIST
- **High VIX (>30)** → Reduce position sizes by 50%
- **Recession risk (>50%)** → Defensive sectors only

---

### **STAGE 13: Market Timing**
**File**: `intelligence_layer.py` → `MarketTimingEngine.get_optimal_entry_window()`

**Process**:
1. **Market Hours Check**: NYSE open?
2. **Earnings Calendar**: Any earnings coming up?
3. **Macro Events**: Fed meetings, CPI, NFP?
4. **Day Patterns**: Monday (volatile), Friday (low volume)

**Output**:
```python
{
    "timing": "ENTER_NOW",
    "reasoning": "Market open, no earnings, Tuesday (optimal liquidity)",
    "optimal_window": "Now",
    "risks": []
}
```

**Possible Timings**:
- `ENTER_NOW` - All clear
- `WAIT_MARKET_OPEN` - After hours
- `WAIT_24H` - Monday/Friday
- `WAIT_POST_EARNINGS` - Earnings in 48 hours

---

### **STAGE 14: Risk Assessment**
**File**: `portfolio_risk.py` → `RiskEngine.assess_risk()`

**Process**:
1. **Scenario Analysis**: Bull/Base/Bear/Black Swan cases
2. **Expected Value**: Probability-weighted return
3. **Risk/Reward Ratio**: Upside vs downside
4. **Stop-Loss**: Dynamic based on conviction
5. **Position Sizing**: Kelly Criterion (half-Kelly for safety)

**Output**:
```python
{
    "scenarios": {
        "bull_case": {"probability": 0.40, "return": 0.50},
        "base_case": {"probability": 0.45, "return": 0.25},
        "bear_case": {"probability": 0.12, "return": -0.10},
        "black_swan": {"probability": 0.03, "return": -0.30}
    },
    "expected_value": 0.235,  # 23.5% expected return
    "risk_reward_ratio": 5.0,  # 5:1 reward to risk
    "stop_loss": {
        "stop_loss_pct": -0.12,
        "reasoning": "High conviction allows wider stop",
        "type": "HARD_STOP"
    },
    "position_sizing": {
        "kelly_full": 0.15,
        "kelly_half": 0.075,
        "recommended": 0.10,
        "kelly_validation": "APPROVED"
    },
    "overall_risk_score": 4.2  # 0-10 scale
}
```

---

### **STAGE 15: Decision & Execution**
**File**: `decision_engine.py` → `DecisionEngine.generate_advice()`

**Process**:
1. Considers user profile (Conservative/Aggressive/Contrarian)
2. Checks story maturity
3. Reviews risk assessment
4. Applies macro adjustments
5. Validates against portfolio limits

**Decision Logic**:

**Conservative**:
- Only MATURE stories
- Low allocation (5-8%)
- Defensive sectors preferred

**Aggressive**:
- DEVELOPING stories OK
- High allocation (10-15%)
- Growth sectors preferred

**Contrarian**:
- Bet against sentiment
- Medium allocation (8-12%)

**Output**:
```python
{
    "action": "BUY",
    "ticker": "TSLA",
    "sector": "Technology",
    "capital_allocation_pct": 10.0,
    "reasoning": "ACTIONABLE story, strong thesis, favorable macro",
    "expected_return": "25-50%",
    "time_horizon": "3-6 months",
    "stop_loss": -12%,
    "exit_strategy": {
        "strategy_type": "TIERED",
        "exits": [
            {"exit_number": 1, "trigger_price": 120, "position_size": 0.33},
            {"exit_number": 2, "trigger_price": 150, "position_size": 0.33},
            {"exit_number": 3, "trigger_type": "TRAILING_STOP", "trail_percent": 0.10, "position_size": 0.34}
        ]
    }
}
```

---

### **STAGE 16: Portfolio Validation**
**File**: `portfolio_risk.py` → `PortfolioManager.validate_allocation()`

**Process**:
1. **Cash Check**: Sufficient funds?
2. **Sector Concentration**: <30% in any sector?
3. **Total Deployment**: <80% of capital?
4. **Single Position**: <15% of portfolio?

**Output**:
```python
{
    "approved": True,
    "reason": "All limits satisfied",
    "warnings": ["⚠️ Technology approaching 25% limit"]
}
```

**If Rejected**:
```python
{
    "approved": False,
    "reason": "Sector concentration: Technology at 35% (max 30%)",
    "warnings": []
}
```

---

### **STAGE 17: Exit Strategy Planning**
**File**: `portfolio_risk.py` → `ExitStrategyPlanner.create_exit_plan()`

**Process**:
Based on conviction level, creates tiered exit strategy

**High Conviction (>80%)**:
- Exit 33% at +20% (lock in gains)
- Exit 33% at +50% (take profit)
- Exit 34% with 10% trailing stop (let it run)

**Medium Conviction (50-80%)**:
- Exit 50% at +25%
- Exit 50% with 8% trailing stop

**Low Conviction (<50%)**:
- Exit 100% at +15% (quick profit)
- Tight -8% stop-loss

---

### **STAGE 18: Trade Execution**
**File**: `portfolio_risk.py` → `PortfolioManager.execute_trade()`

**Process**:
1. Records position in portfolio
2. Updates sector exposure
3. Deducts from cash reserve
4. Saves to `portfolio.json`

**Portfolio State**:
```python
{
    "positions": {
        "TSLA": {
            "amount": 10000,
            "shares": 50,
            "entry_price": 200,
            "entry_date": "2024-02-07",
            "sector": "Technology"
        }
    },
    "sector_exposure": {
        "Technology": 0.25
    },
    "cash_reserve": 40000,
    "total_deployed": 0.60
}
```

---

## Validation & Learning Loop

### **Pattern Validation**
**File**: `validation_learning.py` → `PatternValidator`

Checks if story patterns are consistent:
- **Consistent** (70%+ same pattern) → Thesis is stable
- **Inconsistent** → Warning: Pattern drift detected

### **Sentiment Trend Analysis**
**File**: `validation_learning.py` → `SentimentTrendAnalyzer`

Uses linear regression to detect:
- **STRENGTHENING** → BUY signal
- **DETERIORATING** → EXIT signal
- **STABLE** → HOLD

### **Backtesting**
**File**: `validation_learning.py` → `BacktestEngine`

Tracks predictions vs actual outcomes:
- Records predicted return
- Validates with actual return
- Calculates accuracy
- Identifies failing patterns

### **User Feedback**
**File**: `validation_learning.py` → `FeedbackSystem`

Learns from user outcomes:
- Upweights successful patterns
- Downweights failing patterns
- Personalizes recommendations

---

## Complete Data Flow Example

**Input**: News article "Tesla raises $5B"

**Stage 1-3**: Ingest → Deduplicate → Fetch full content  
**Stage 4**: Extract entities: `["Tesla", "Elon Musk"]`  
**Stage 5**: Sentiment: `Bullish (0.75)`  
**Stage 6**: Cognitive: `"Signals aggressive expansion"`  
**Stage 7**: Match to existing "Tesla Expansion" story  
**Stage 8**: Maturity: `ACTIONABLE (3 events)`  
**Stage 9**: Thesis: `STRENGTHENING (conviction 0.85)`  
**Stage 10**: Opportunity: `ASYMMETRIC_UPSIDE (25-50%)`  
**Stage 11**: Competitive: `STRONG position, GAINING share`  
**Stage 12**: Macro: `BULL market, VIX 18, NEUTRAL Fed`  
**Stage 13**: Timing: `ENTER_NOW (market open)`  
**Stage 14**: Risk: `EV 23.5%, R:R 5:1, Stop -12%`  
**Stage 15**: Decision: `BUY 10% allocation`  
**Stage 16**: Portfolio: `APPROVED (all limits OK)`  
**Stage 17**: Exit: `Tiered (33%/33%/34%)`  
**Stage 18**: Execute: `Buy 50 shares @ $200`

**Output**: Position opened, portfolio updated, exit strategy set

---

## File Responsibilities Summary

| File | Responsibility |
|------|---------------|
| `data_ingestion.py` | Scraping, entity extraction, content fetching |
| `deduplication_engine.py` | Duplicate detection |
| `analysis_engine.py` | Sentiment analysis |
| `cognitive_layer.py` | Deep reasoning, thesis, opportunities |
| `context_memory.py` | Story matching, memory management |
| `maturity_engine.py` | Maturity assessment |
| `entity_graph.py` | Entity relationships, impact chains |
| `intelligence_layer.py` | Competitive, macro, timing |
| `portfolio_risk.py` | Portfolio, risk, exit strategy |
| `decision_engine.py` | Investment decisions |
| `validation_learning.py` | Pattern validation, sentiment trends, backtesting, feedback |
| `server.py` | API endpoints, orchestration |
| `autonomous_monitor.py` | Automated monitoring loop |

---

## API Endpoints by Stage

| Endpoint | Stage | Purpose |
|----------|-------|---------|
| `POST /api/refresh` | 1 | Trigger news ingestion |
| `GET /api/stories` | 7 | Get all stories |
| `GET /api/portfolio` | 16 | Portfolio summary |
| `GET /api/risk/{story_id}` | 14 | Risk assessment |
| `GET /api/competitive/{story_id}` | 11 | Competitive analysis |
| `GET /api/macro` | 12 | Macro context |
| `GET /api/timing/{story_id}` | 13 | Market timing |
| `GET /api/exit-strategy/{story_id}` | 17 | Exit strategy |
| `POST /api/portfolio/trade` | 18 | Execute trade |
| `GET /api/backtest/report` | Learning | Performance metrics |

---

**This is the complete, production-grade investment intelligence pipeline!** 🚀
