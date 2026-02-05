// Type definitions for AI Investment Intelligence platform

export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Maturity = 'Developing' | 'Mature';
export type RiskTolerance = 'Conservative' | 'Aggressive' | 'Contrarian';
export type InvestmentHorizon = 'Short' | 'Medium' | 'Long';
export type SystemStatus = 'healthy' | 'warning' | 'error';

export interface Story {
  id: string;
  title: string;
  summary: string;
  maturity: Maturity;
  updateCount: number;
  sentiment: Sentiment;
  topic: string;
  lastUpdated: string;
  sentimentHistory: SentimentPoint[];
  updates: StoryUpdate[];
  relatedEntities: string[];
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
  totalStories: number;
  activeStories: number;
  newUpdatesToday: number;
  overallSentiment: Sentiment;
}

export interface RecentActivity {
  id: string;
  timestamp: string;
  type: 'story_updated' | 'analysis_completed' | 'new_story';
  title: string;
  sentiment?: Sentiment;
}
