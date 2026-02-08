// Type definitions for AI Investment Intelligence platform

export type Sentiment = 'positive' | 'neutral' | 'negative';
export type SentimentLabel = 'Bullish' | 'Bearish' | 'Neutral';
export type Maturity = 'Developing' | 'Mature';
export type RiskTolerance = 'Conservative' | 'Aggressive' | 'Contrarian';
export type InvestmentHorizon = 'Short' | 'Medium' | 'Long';
export type SystemStatus = 'healthy' | 'warning' | 'error';
export type StoryStatus = 'ACTIVE' | 'INACTIVE';

export interface Hypothesis {
  sentiment_score: number; // -1 to 1
  sentiment_label: SentimentLabel;
  key_event_type: string;
  why: string;
  what: string;
  how: string;
  expected_impact: string;
}

export interface StoryEvent {
  date: string;
  title: string;
  sentiment: Hypothesis;
  pattern: string;
}

export interface RealWorldOpportunity {
  type: string;
  item: string;
  action: string;
  timing: string;
  investment: string;
  expected_savings: string;
  reasoning: string;
}

export interface MarketEntity {
  entity: string;
  reason: string;
  expected_impact: string;
}

export interface NextMove {
  move: string;
  timeframe: string;
  probability: number;
}

export interface CognitiveAnalysis {
  so_what: string;
  winners: MarketEntity[];
  losers: MarketEntity[];
  unsaid: string;
  next_moves: NextMove[];
  conviction: number;
  contrarian_angle: string;
  real_world_opportunities: RealWorldOpportunity[];
}

export interface MaturityAssessment {
  score: number;
  maturity_level: Maturity;
  confidence: number;
  evidence_count: number;
  missing_factors: string[];
}

export interface Story {
  id: string;
  title: string;
  summary: string;
  maturity: Maturity;
  status: StoryStatus;
  updateCount: number;
  sentiment: Sentiment;
  sentimentScore: number; // Numeric score from -1 to 1
  sentimentLabel: SentimentLabel;
  topic: string;
  lastUpdated: string;
  sentimentHistory: SentimentPoint[];
  updates: StoryUpdate[];
  relatedEntities: string[];
  subreport?: string; // Gemini-generated strategic intelligence report
  currentHypothesis: Hypothesis | null;
  previousHypothesis: Hypothesis | null;
  cognitive_analysis?: CognitiveAnalysis; // NEW: Brain 2 Data
  maturityAssessment?: MaturityAssessment; // NEW: Detailed Maturity Data
  events: StoryEvent[];
  createdAt: string;
}

export interface SentimentPoint {
  date: string;
  value: number; // -1 to 1
  sentiment: Sentiment;
}

export interface StoryUpdate {
  id: string;
  timestamp: string;
  headline: string;
  sentiment: Sentiment;
  sentimentScore?: number;
  keyEventType?: string;
  pattern?: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  inputText: string;
  entities: string[];
  sentiment: Sentiment;
  sentimentScore: number;
  storyContext: string | null;
  personalizedAdvice: string;
  cognitive_analysis?: CognitiveAnalysis;
}

export interface UserProfile {
  riskTolerance: RiskTolerance;
  capitalAvailable: number;
  investmentHorizon: InvestmentHorizon;
}

export interface SystemHealth {
  ingestion: {
    status: SystemStatus;
    lastUpdate: string;
    articlesProcessed: number;
  };
  analysis: {
    status: SystemStatus;
    lastUpdate: string;
    analysisCount: number;
  };
  memory: {
    status: SystemStatus;
    lastUpdate: string;
    storiesTracked: number;
  };
}

export interface DashboardStats {
  total_stories: number;
  total_articles: number;
  total_errors: number;
}

// Dynamic Scraper Types
export interface ScraperConfig {
  interval_minutes: number;
  runtime_hours: number;
  auto_start: boolean;
}

export interface ScraperStats {
  started_at: string | null;
  last_run: string | null;
  total_runs: number;
  total_articles: number;
  total_stories: number;
  errors: number;
}

export interface ScraperStatus {
  is_running: boolean;
  config: ScraperConfig;
  stats: ScraperStats;
  next_run: string | null;
}

export interface RecentActivity {
  id: string;
  timestamp: string;
  type: 'story_updated' | 'analysis_completed' | 'new_story';
  title: string;
  sentiment?: Sentiment;
}
