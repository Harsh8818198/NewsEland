# Subreport Generation Flow - Complete Breakdown

## Overview

The **SubReportGenerator** creates detailed intelligence reports by synthesizing news analysis with historical context. Here's exactly where and how it's generated:

---

## Where Subreports Are Generated

### **Primary Location: `gemini_subreport.py`**

**File**: `gemini_subreport.py`  
**Class**: `SubReportGenerator`  
**Main Method**: `generate_sub_report(article, analysis_result, story_context)`

```python
# Line 15-42
class SubReportGenerator:
    def generate_sub_report(self, article, analysis_result, story_context=None):
        """
        Synthesizes BRAIN 1 (News) and BRAIN 3 (Analysis) into a readable report.
        """
        if self.mock_mode:
            return self._generate_mock_report(article, analysis_result)
        
        try:
            prompt = self._construct_prompt(article, analysis_result, story_context)
            response = self.model.generate_content(prompt)  # ← GEMINI API CALL
            return response.text
        except Exception as e:
            logging.error(f"Gemini Report Gen Failed: {e}")
            return self._generate_mock_report(article, analysis_result)
```

---

## Who Calls the SubReportGenerator?

### **1. DecisionEngine (Primary User)**

**File**: `decision_engine.py`  
**Line**: 11 (initialization), 93 (usage)

```python
# Initialization
class DecisionEngine:
    def __init__(self, mock_mode=False):
        self.subreport_gen = SubReportGenerator(mock_mode=mock_mode)

# Usage in generate_advice()
def _generate_cognitive_advice(self, user_profile, sub_report_text, story_context):
    # Line 93
    response = self.subreport_gen.model.generate_content(prompt)
```

**When**: Called during investment decision generation  
**Purpose**: Uses subreport to generate personalized investment advice

---

### **2. Server (Initialization Only)**

**File**: `server.py`  
**Line**: 44

```python
# Line 44
report_gen = SubReportGenerator(mock_mode=False)
```

**When**: Server startup  
**Purpose**: Initialized but **NOT actively used** in current server endpoints  
**Status**: ⚠️ **UNUSED** - This is a legacy initialization

---

### **3. Autonomous Monitor**

**File**: `autonomous_monitor.py`  
**Line**: 49

```python
# Line 49
reporter = SubReportGenerator(mock_mode=False)
```

**When**: During automated monitoring cycles  
**Purpose**: Generates reports for mature stories during autonomous operation

---

### **4. Test Flow Verification**

**File**: `test_flow_verification.py`  
**Line**: 60

```python
# Line 60
reporter = SubReportGenerator(mock_mode=True)  # Mock mode for testing
```

**When**: During system testing  
**Purpose**: Verifies report generation without making real API calls

---

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    1. NEWS INGESTION                         │
│  NewsScraper.fetch_articles()                                │
│  → Returns: article = {title, url, content, ...}             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    2. ENTITY EXTRACTION                      │
│  EntityExtractor.extract_entities(article['content'])        │
│  → Returns: entities = ["Tesla", "Elon Musk", ...]          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    3. SENTIMENT ANALYSIS                     │
│  AnalysisEngine.analyze_sentiment(article)                   │
│  → Returns: analysis_result = {                              │
│       sentiment: {sentiment_label, score, ...},              │
│       matched_patterns: [...],                               │
│       second_order_effects: [...]                            │
│    }                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    4. MEMORY UPDATE                          │
│  ContextMemory.update_story(article, analysis, entities)     │
│  → Returns: story_context = {                                │
│       main_topic: "Tesla Expansion",                         │
│       events: [{...}, {...}],                                │
│       previous_hypothesis: {...},                            │
│       current_hypothesis: {...}                              │
│    }                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              5. SUBREPORT GENERATION ⭐                      │
│  SubReportGenerator.generate_sub_report(                     │
│      article,                                                │
│      analysis_result,                                        │
│      story_context                                           │
│  )                                                            │
│  → Calls: Gemini API with detailed prompt                    │
│  → Returns: sub_report_text (markdown formatted report)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    6. DECISION GENERATION                    │
│  DecisionEngine.generate_advice(                             │
│      user_profile,                                           │
│      sub_report_text,                                        │
│      story_context                                           │
│  )                                                            │
│  → Returns: Investment recommendation (BUY/SELL/HOLD)        │
└─────────────────────────────────────────────────────────────┘
```

---

## What the Subreport Contains

The subreport is a **markdown-formatted intelligence report** that includes:

### **1. Contextual History**
- Timeline of previous events in the story
- Sentiment progression over time

### **2. Before vs After Analysis**
- Previous hypothesis (before this event)
- Current hypothesis (after this event)
- How the story has evolved

### **3. Pattern Analysis**
- Matched historical patterns
- Expected outcomes based on patterns

### **4. Second-Order Effects**
- Indirect consequences
- Ripple effects across markets

### **5. Synthesis**
- What changed?
- What stayed the same?
- What does this mean for investors?

---

## Example Subreport Prompt

```
You are an elite financial intelligence analyst (The Dialectical Synthesizer).

**CURRENT NEWS**: "Tesla raises $5B in new funding"
**SOURCE**: Reuters

**CONTEXTUAL HISTORY (The Narrative Arc)**:
- 2024-02-01: Tesla announces new factory (Bullish)
- 2024-02-05: Tesla hires 500 engineers (Bullish)

**PREVIOUS HYPOTHESIS (Before this event)**:
- Why: Tesla preparing for expansion
- Expected Impact: Increased production capacity

**CURRENT HYPOTHESIS (After this event)**:
- Why: Tesla securing capital for aggressive growth
- Expected Impact: Accelerated market penetration

**MATCHED PATTERNS**:
- Capital Injection → Historically leads to 20-30% stock appreciation
- Expansion Phase → Typically followed by new product launches

**SECOND-ORDER EFFECTS**:
- Lithium demand will increase
- Competitors will feel pressure to raise capital
- Supply chain partners will see increased orders

**YOUR TASK**:
Synthesize this into a coherent intelligence report explaining:
1. What changed from the previous state?
2. What stayed the same?
3. What does this mean for investors?
```

---

## When Subreports Are Generated

### **Scenario 1: Manual Analysis**
**Trigger**: User calls `POST /api/analyze`  
**Flow**: 
1. User submits headline
2. System analyzes → generates subreport
3. Returns analysis + subreport

**Currently**: ⚠️ **NOT IMPLEMENTED** in current server endpoints

---

### **Scenario 2: Autonomous Monitoring**
**Trigger**: `autonomous_monitor.py` runs on schedule  
**Flow**:
1. Scrapes news
2. Analyzes articles
3. Updates stories
4. Generates subreports for **MATURE** stories only
5. Saves to memory

**Currently**: ✅ **ACTIVE** if autonomous monitor is running

---

### **Scenario 3: Decision Generation**
**Trigger**: When generating investment advice  
**Flow**:
1. User requests advice for a story
2. DecisionEngine calls SubReportGenerator
3. Uses subreport to create personalized recommendation

**Currently**: ✅ **ACTIVE** via DecisionEngine

---

## Current Issues & Gaps

### **❌ Problem 1: Server Initialization Unused**
```python
# server.py line 44
report_gen = SubReportGenerator(mock_mode=False)  # ← NEVER USED
```

**Issue**: Initialized but no endpoint calls it  
**Fix Needed**: Either remove or create endpoint like `GET /api/subreport/{story_id}`

---

### **❌ Problem 2: No Direct Subreport Endpoint**
**Missing**: `GET /api/stories/{story_id}/subreport`

**What it should do**:
```python
@app.get("/api/stories/{story_id}/subreport")
def get_story_subreport(story_id: str):
    story = memory.knowledge_graph.get('stories', {}).get(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # Get latest event
    latest_event = story['events'][-1]
    
    # Generate subreport
    subreport = report_gen.generate_sub_report(
        article=latest_event,
        analysis_result=latest_event.get('analysis', {}),
        story_context=story
    )
    
    return {"story_id": story_id, "subreport": subreport}
```

---

### **❌ Problem 3: Subreports Not Stored**
**Issue**: Subreports are generated on-demand but **not saved** to memory

**Fix Needed**: Add `subreport` field to story events:
```python
story['events'][-1]['subreport'] = subreport_text
```

---

## Files Involved

| File | Role | Lines |
|------|------|-------|
| `gemini_subreport.py` | **Generates subreports** | 15-148 |
| `decision_engine.py` | **Uses subreports for decisions** | 2, 11, 93 |
| `autonomous_monitor.py` | **Generates subreports during monitoring** | 9, 49 |
| `server.py` | **Initializes (unused)** | 9, 44 |
| `test_flow_verification.py` | **Testing** | 5, 60 |

---

## Recommended Changes

### **1. Add Subreport Endpoint**
Create `GET /api/stories/{story_id}/subreport` to expose subreports to frontend

### **2. Store Subreports in Memory**
Save generated subreports to `story['events'][i]['subreport']`

### **3. Remove Unused Initialization**
Either use `report_gen` in server.py or remove it

### **4. Add Subreport to Story Response**
Include subreport in `GET /api/stories` response for mature stories

---

## Summary

**Where Generated**: `gemini_subreport.py` → `SubReportGenerator.generate_sub_report()`  
**Who Calls It**: `DecisionEngine`, `autonomous_monitor.py`  
**When**: During decision generation or autonomous monitoring  
**Current Status**: ✅ Working but **not exposed via API**  
**Main Gap**: No direct endpoint to fetch subreports for frontend display

**The subreport is the "intelligence synthesis" layer that connects raw analysis to actionable insights!** 📊
