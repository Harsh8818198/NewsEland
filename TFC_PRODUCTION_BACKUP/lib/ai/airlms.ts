import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface AIRLMSOutput {
  perception: {
    entities: Array<{
      name: string;
      type: 'company' | 'person' | 'event' | 'concept';
      symbol?: string;
      relevance: number;
    }>;
    keywords: string[];
    mentioned_symbols: string[];
  };
  contextualization: {
    market_context: string;
    historical_parallels: string[];
    sector: string;
    related_events: string[];
  };
  analysis: {
    sentiment: number; // -1 to 1
    impact_level: 'low' | 'medium' | 'high' | 'critical';
    bullish_factors: string[];
    bearish_factors: string[];
    risk_assessment: string;
  };
  synthesis: {
    key_insight: string;
    market_implication: string;
    affected_sectors: string[];
    confidence_level: number; // 0 to 1
  };
  recommendation: {
    action: 'ENTRY' | 'EXIT' | 'HOLD';
    reasoning: string;
    time_horizon: 'short' | 'medium' | 'long';
    confidence: number; // 0 to 1
  };
}

export async function processWithAIRLMS(
  newsTitle: string,
  newsContent: string,
  userHoldings?: string[]
): Promise<AIRLMSOutput> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are TFC (The Financial Chronicle) - an advanced AI financial analyst with a 5-layer reasoning system.

Analyze this financial news article using the AIRLMS framework:

**Article Title:** ${newsTitle}
**Content:** ${newsContent}
${userHoldings ? `**User's Portfolio Holdings:** ${userHoldings.join(', ')}` : ''}

Provide analysis in the following structured format:

**LAYER 1 - PERCEPTION:**
Extract:
- Entities (companies, people, events) with type and relevance score (0-1)
- Key financial keywords
- Stock symbols mentioned

**LAYER 2 - CONTEXTUALIZATION:**
Provide:
- Current market context
- Historical parallels (similar past events)
- Affected sector
- Related market events

**LAYER 3 - ANALYSIS:**
Evaluate:
- Sentiment score (-1 to 1, where -1 is very bearish, 1 is very bullish)
- Impact level (low/medium/high/critical)
- Bullish factors (list 3-5)
- Bearish factors (list 3-5)
- Risk assessment (brief)

**LAYER 4 - SYNTHESIS:**
Synthesize:
- Key insight (1-2 sentences)
- Market implication
- Affected sectors
- Confidence level (0-1)

**LAYER 5 - RECOMMENDATION:**
${userHoldings && userHoldings.length > 0 
  ? `Based on user's holdings (${userHoldings.join(', ')}), recommend:`
  : 'Recommend:'}
- Action (ENTRY/EXIT/HOLD)
- Detailed reasoning
- Time horizon (short/medium/long term)
- Confidence (0-1)

Respond ONLY with valid JSON in this exact structure:
{
  "perception": {
    "entities": [{"name": "string", "type": "company|person|event|concept", "symbol": "string|null", "relevance": 0.0}],
    "keywords": ["string"],
    "mentioned_symbols": ["string"]
  },
  "contextualization": {
    "market_context": "string",
    "historical_parallels": ["string"],
    "sector": "string",
    "related_events": ["string"]
  },
  "analysis": {
    "sentiment": 0.0,
    "impact_level": "low|medium|high|critical",
    "bullish_factors": ["string"],
    "bearish_factors": ["string"],
    "risk_assessment": "string"
  },
  "synthesis": {
    "key_insight": "string",
    "market_implication": "string",
    "affected_sectors": ["string"],
    "confidence_level": 0.0
  },
  "recommendation": {
    "action": "ENTRY|EXIT|HOLD",
    "reasoning": "string",
    "time_horizon": "short|medium|long",
    "confidence": 0.0
  }
}
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                      responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON in AI response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const analysis = JSON.parse(jsonText) as AIRLMSOutput;

    // Validate the structure
    if (!analysis.perception || !analysis.recommendation) {
      throw new Error('Invalid AIRLMS output structure');
    }

    return analysis;
  } catch (error) {
    console.error('AIRLMS processing error:', error);
    throw error;
  }
}

export async function generateSignalForHolding(
  symbol: string,
  newsArticles: Array<{ title: string; content: string; sentiment_score?: number }>
): Promise<{
  signal: 'ENTRY' | 'EXIT' | 'HOLD';
  confidence: number;
  reasoning: string;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const articlesContext = newsArticles
    .slice(0, 5) // Analyze top 5 most recent articles
    .map((a, i) => `Article ${i + 1}: ${a.title}\nSentiment: ${a.sentiment_score || 'N/A'}`)
    .join('\n\n');

  const prompt = `
You are a financial analyst for TFC. Analyze recent news about ${symbol} and generate a trading signal.

**Recent News:**
${articlesContext}

Based on this information, provide:
1. Signal (ENTRY/EXIT/HOLD)
2. Confidence (0-1)
3. Detailed reasoning

Respond ONLY with valid JSON:
{
  "signal": "ENTRY|EXIT|HOLD",
  "confidence": 0.0,
  "reasoning": "string"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                      responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON in signal generation response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Signal generation error:', error);
    throw error;
  }
}
