# How the Analysis System Works

## Overview
The system is designed as a multi-brain AI architecture that processes financial news and generates personalized investment advice. Think of it as having multiple specialized AI "brains" working together.

---

## The 5-Brain Architecture

### 🧠 BRAIN 1: The Omniscient Observer (Data Ingestion)
**File:** `Backend/data_ingestion.py`

**What it does:**
1. **News Scraper** - Fetches latest articles from TechCrunch and other sources
2. **Entity Extractor** - Uses spaCy NLP to identify:
   - Organizations (companies like "Nvidia", "Tesla")
   - Geopolitical entities (countries, cities)
   - Products (like "Blackwell AI chip")
   - People (CEOs, executives)

**Example:**
```
Input: "Nvidia reveals new Blackwell AI chip, warning of supply constraints"
Output: {
  "ORG": ["Nvidia"],
  "PRODUCT": ["Blackwell AI chip"]
}
```

---

### 🧠 BRAIN 2: The Hippocampus (Context Memory)
**File:** `Backend/context_memory.py`

**What it does:**
- Stores all news events in a "Knowledge Graph" (JSON database)
- Groups related news into "Stories" based on entity overlap
- Tracks story evolution over time:
  - **DEVELOPING** → Less than 2 updates (risky, early stage)
  - **MATURE** → 2+ updates (confirmed pattern, safer)

**Story Matching Logic:**
```python
# If new article mentions "Nvidia" and we already have a story about Nvidia
# → Add to existing story
# Otherwise → Create new story
```

**Example Story Structure:**
```json
{
  "id": "STORY_1770317454",
  "main_topic": "General Market involving ElevenLabs",
  "maturity": "MATURE",
  "updates_count": 15,
  "entities": ["Meta", "Sequoia", "OpenAI", "ElevenLabs"],
  "events": [
    {
      "date": "2026-02-06T00:20:54",
      "title": "ElevenLabs CEO: Voice is the next interface for AI",
      "sentiment": {
        "sentiment_score": 0.4,
        "sentiment_label": "Bullish"
      }
    }
  ]
}
```

---

### 🧠 BRAIN 3: The Temporal Prophet (Analysis Engine)
**File:** `Backend/analysis_engine.py`

**What it does:**
1. **Sentiment Analysis** - Uses Google Gemini AI to determine:
   - Sentiment score (-1.0 to 1.0)
   - Label (Bullish/Bearish/Neutral)
   - Event type (Earnings, M&A, Product Launch, Regulation)

2. **Pattern Matching** - Compares news to historical patterns:
   - **Regulatory Headwind** → Keywords: "regulation", "antitrust", "ban"
   - **Supply Crunch** → Keywords: "shortage", "supply chain"
   - **Capital Injection** → Keywords: "funding", "raise", "series B"

3. **Second-Order Effects** - Infers indirect impacts:
   ```
   If "Nvidia" mentioned → Affects:
   - Data Center Power Consumption (Utilities)
   - Advanced Packaging (TSMC/Amkor)
   ```

**Example Analysis:**
```json
{
  "sentiment": {
    "sentiment_score": 0.7,
    "sentiment_label": "Bullish",
    "key_event_type": "Product Launch"
  },
  "matched_patterns": [
    {
      "pattern_name": "Supply Crunch",
      "historical_outcome": "Pricing power increases",
      "example": "Chip Shortage (2020)"
    }
  ],
  "second_order_effects": [
    "Data Center Power Consumption (Utilities)",
    "Advanced Packaging (TSMC/Amkor)"
  ]
}
```

---

### 🧠 BRAIN 4: The Dialectical Synthesizer (Gemini Subreport)
**File:** `Backend/gemini_subreport.py`

**What it does:**
- Takes the analysis + story history
- Generates a comprehensive "Strategic Intelligence Report" using Gemini AI
- Includes:
  1. **Narrative Evolution** - How the story changed over time
  2. **Historical Lens** - Comparison to past similar events
  3. **Probabilistic Projection** - Base case vs contrarian scenarios
  4. **Actionable Intelligence** - Specific tickers to watch/buy/sell
  5. **Confidence Score** - 0-100 reliability rating

**Example Report:**
```markdown
## Strategic Intelligence Report

### Narrative Evolution
This event marks an acceleration in the AI infrastructure race. 
Previous updates showed gradual adoption; this represents a step-change.

### Historical Patterns
Structurally mirrors the **Supply Crunch** pattern:
- Historical Outcome: Pricing power increases, margins expand
- Example: Chip Shortage (2020)

### Probabilistic Projection
- **Scenario A (65%)**: Supply constraints drive pricing power
- **Scenario B (35%)**: Demand destruction from macro headwinds

### Actionable Intelligence
- **Direct Plays**: Nvidia, TSMC, AMD
- **Hidden Gems**: Utilities (power consumption), Amkor (packaging)

**Confidence: 78/100**
```

---

### 🧠 BRAIN 5: The Financial Guide (Decision Engine)
**File:** `Backend/decision_engine.py`

**What it does:**
- Takes the Gemini report + User profile + Story maturity
- Generates personalized investment advice based on:

**Decision Matrix:**
```
Story Maturity × User Risk Tolerance = Action

DEVELOPING + Aggressive    → Small speculative position (2% capital)
DEVELOPING + Conservative  → Wait and watch (no action)

MATURE + Aggressive        → Strong buy (40% allocation)
MATURE + Conservative      → Defensive allocation (15% ETF)
```

**User Profile Factors:**
- **Risk Tolerance**: Conservative / Aggressive / Contrarian
- **Capital Available**: How much money to invest
- **Investment Horizon**: Short / Medium / Long term

**Example Advice:**
```
🧭 YOUR FINANCIAL GUIDE (Conservative Profile)
   Story Context: General Market involving ElevenLabs (MATURE)
   (Capital: $100,000 | Horizon: Long-term)

👉 Guidance: ALLOCATE (Defensive)
   - Trend is solid. Safe to enter.
   - Allocation: 15% ($15,000) into Sector ETF.
   - Strategy: Buy established players, avoid leverage.
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
│  1. System auto-scrapes news OR user enters headline        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  BRAIN 1: Data Ingestion (data_ingestion.py)               │
│  • Scrape TechCrunch articles                               │
│  • Extract entities (Nvidia, Tesla, etc.)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  BRAIN 3: Analysis Engine (analysis_engine.py)             │
│  • Gemini AI: Sentiment analysis                            │
│  • Pattern matching (Supply Crunch, Regulation, etc.)       │
│  • Second-order effects (indirect impacts)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  BRAIN 2: Context Memory (context_memory.py)               │
│  • Check if related to existing story                       │
│  • Update story OR create new story                         │
│  • Track maturity: DEVELOPING → MATURE                      │
│  • Save to knowledge_graph.json                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  BRAIN 4: Gemini Subreport (gemini_subreport.py)          │
│  • Generate comprehensive strategic report                  │
│  • Compare current event to story history                   │
│  • Provide scenarios and actionable intelligence            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  BRAIN 5: Decision Engine (decision_engine.py)             │
│  • Load user profile (risk tolerance, capital, horizon)     │
│  • Apply decision matrix                                    │
│  • Generate personalized investment advice                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND DISPLAY                          │
│  • Show analysis results                                     │
│  • Display Gemini strategic report                          │
│  • Present personalized advice                              │
│  • Update story cards in Stories Feed                       │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### `/api/analyze` (POST)
**What happens when you analyze a headline:**

1. **Input:** `{ "text": "Nvidia reveals new chip" }`

2. **Processing:**
   ```python
   # Step 1: Extract entities
   entities = extractor.extract_entities(headline)
   # → {"ORG": ["Nvidia"], "PRODUCT": ["chip"]}
   
   # Step 2: Analyze with Gemini
   analysis = analyzer.analyze_news(article, entities)
   # → Sentiment, patterns, second-order effects
   
   # Step 3: Update memory
   story = memory.update_story(article, analysis, entities)
   # → Creates or updates story in knowledge graph
   
   # Step 4: Generate subreport
   subreport = report_gen.generate_report(article, analysis, story)
   # → Full strategic intelligence report
   
   # Step 5: Generate advice
   advice = decision_engine.generate_advice(user_profile, subreport, story)
   # → Personalized investment guidance
   ```

3. **Output:**
   ```json
   {
     "analysis": { "sentiment": "Bullish", "patterns": [...] },
     "entities": ["Nvidia"],
     "story_context": { "topic": "...", "maturity": "MATURE" },
     "advice": "🧭 YOUR FINANCIAL GUIDE...",
     "user_profile": "Conservative"
   }
   ```

### `/api/stories` (GET)
**Returns all active stories from knowledge graph:**
- Each story includes all events, entities, maturity level
- Backend generates a fresh Gemini subreport for each story
- Frontend displays in Stories Feed

### `/api/refresh-news` (POST)
**Triggers the autonomous monitoring:**
1. Scrapes latest articles from TechCrunch
2. Processes each article through the 5-brain pipeline
3. Updates knowledge graph with new events
4. Returns count of new/updated stories

---

## Key Concepts

### Story Maturity
- **DEVELOPING**: < 2 updates → High risk, early signal
- **MATURE**: ≥ 2 updates → Confirmed pattern, more reliable

### Pattern Recognition
The system recognizes these historical patterns:
1. **Regulatory Headwind** → Sector dips 5-8% short term
2. **Supply Crunch** → Pricing power increases, margins expand
3. **Capital Injection** → Talent war, increased ad spending

### Second-Order Effects
Indirect impacts that most investors miss:
- Nvidia growth → Utilities (power), TSMC (packaging)
- Tesla growth → Lithium miners, charging infrastructure

### Decision Matrix
```
Risk Profile × Story Maturity × Pattern Strength = Action

Conservative + Developing = WAIT
Conservative + Mature + Bullish = 15% ETF allocation
Aggressive + Mature + Bullish = 40% direct position
Contrarian + Bearish = Contrarian opportunity
```

---

## Example: Complete Analysis Flow

**Input:** User enters "ElevenLabs raises $500M from Sequoia"

**Step 1 - Entity Extraction:**
```
ORG: ["ElevenLabs", "Sequoia"]
```

**Step 2 - Gemini Analysis:**
```json
{
  "sentiment_score": 0.8,
  "sentiment_label": "Bullish",
  "key_event_type": "Funding"
}
```

**Step 3 - Pattern Matching:**
```
Matched: "Capital Injection"
Historical Outcome: "Talent war intensifies, ad spend increases"
```

**Step 4 - Memory Check:**
```
Found existing story: "General Market involving ElevenLabs"
Current maturity: MATURE (15 updates)
Adding this as update #16
```

**Step 5 - Gemini Subreport:**
```markdown
## Strategic Intelligence Report

This marks a significant milestone in the AI voice space.
ElevenLabs has now raised $500M at $11B valuation.

**Historical Pattern**: Capital Injection
- Similar to OpenAI's funding rounds (2023)
- Typically leads to aggressive market expansion

**Scenarios:**
- Base Case (70%): Market consolidation, ElevenLabs becomes category leader
- Contrarian (30%): Overvaluation, correction within 12 months

**Direct Plays**: ElevenLabs (private), voice AI sector
**Hidden Gems**: Cloud infrastructure (AWS, Azure), audio hardware

**Confidence: 82/100**
```

**Step 6 - Personalized Advice (Conservative User):**
```
🧭 YOUR FINANCIAL GUIDE (Conservative Profile)
   Story Context: General Market involving ElevenLabs (MATURE)
   (Capital: $50,000 | Horizon: Medium)

👉 Guidance: ALLOCATE (Defensive)
   - Trend is solid with 16 confirmations. Safe to enter.
   - Allocation: 15% ($7,500) into AI/Cloud ETF
   - Strategy: Avoid direct private equity, use public proxies
   - Watch: Microsoft (Azure), Amazon (AWS) as indirect plays
```

---

## Why This Architecture?

1. **Separation of Concerns**: Each brain has one job
2. **Memory**: Stories evolve over time, not just one-off analysis
3. **Personalization**: Same news → different advice based on user
4. **Transparency**: You see the full reasoning chain
5. **Scalability**: Easy to add new patterns, sources, or analysis methods

---

## Files Summary

| File | Purpose | Key Function |
|------|---------|--------------|
| `data_ingestion.py` | Scrape news + extract entities | `fetch_articles()`, `extract_entities()` |
| `analysis_engine.py` | Sentiment + pattern matching | `analyze_news()` |
| `context_memory.py` | Store stories, track evolution | `update_story()` |
| `gemini_subreport.py` | Generate strategic report | `generate_report()` |
| `decision_engine.py` | Personalized investment advice | `generate_advice()` |
| `server.py` | API endpoints | `/api/analyze`, `/api/stories` |
| `knowledge_graph.json` | Database of all stories | Persistent storage |

---

## Next Steps to Understand

1. **Try the Analyzer**: Enter a headline and watch the full pipeline
2. **Check Stories Feed**: See how multiple events group into stories
3. **Adjust Your Profile**: Change risk tolerance and see advice change
4. **Read the Subreports**: See how Gemini connects the dots
5. **Monitor Maturity**: Watch stories evolve from DEVELOPING → MATURE
