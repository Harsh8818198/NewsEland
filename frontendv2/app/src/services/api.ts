// API Service Layer for AI Investment Intelligence Platform
// Base URL: http://localhost:8000

const BASE_URL = 'http://localhost:8000';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode?: number;
  isNetworkError: boolean;

  constructor(
    message: string,
    statusCode?: number,
    isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isNetworkError = isNetworkError;
  }

  get isClientError(): boolean {
    return this.statusCode !== undefined && this.statusCode >= 400 && this.statusCode < 500;
  }

  get isServerError(): boolean {
    return this.statusCode !== undefined && this.statusCode >= 500;
  }

  get userMessage(): string {
    if (this.isNetworkError) {
      return 'Unable to connect to the server. Please check your connection.';
    }
    if (this.statusCode === 404) {
      return 'The requested resource was not found.';
    }
    if (this.statusCode === 401) {
      return 'You are not authorized to perform this action.';
    }
    if (this.statusCode === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (this.isServerError) {
      return 'A server error occurred. Please try again later.';
    }
    return this.message || 'An unexpected error occurred.';
  }
}

// HTTP Client Interface
export interface IHttpClient {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data?: any): Promise<T>;
  put<T>(endpoint: string, data: any): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

// Fetch HTTP Client Implementation
export class FetchHttpClient implements IHttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return {} as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', undefined, true);
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }
}

// TypeScript Interfaces for API Responses

export interface HealthResponse {
  status: string;
  message: string;
}

export interface SystemStatusResponse {
  status: string;
  brains: {
    ingestion: string;
    analysis: string;
    memory: string;
    portfolio: string;
    intelligence: string;
  };
  stories_tracked: number;
}

export interface Hypothesis {
  sentiment_score: number;
  sentiment_label: 'Bullish' | 'Bearish' | 'Neutral';
  key_event_type: string;
  why: string;
  what: string;
  how: string;
  expected_impact: string;
}

export interface StoryEvent {
  date: string;
  title: string;
  sentiment: {
    score: number;
    label: string;
  };
  pattern: string;
}

export interface BackendStory {
  id: string;
  created_at: string;
  main_topic: string;
  maturity: 'DEVELOPING' | 'MATURE' | 'ACTIONABLE';
  status: 'ACTIVE' | 'INACTIVE';
  updates_count: number;
  entities?: string[];
  current_hypothesis: Hypothesis | null;
  previous_hypothesis: Hypothesis | null;
  events: StoryEvent[];
  subreport?: string;
  cognitive_analysis?: any;
  sentiment_trend?: any;
  pattern_validation?: any;
}

export interface StoriesResponse {
  stories: BackendStory[];
}

export interface RefreshResponse {
  status: string;
  success: boolean;
  articles_found: number;
  new_stories: number;
  message: string;
}

export interface ResetResponse {
  status: string;
  success: boolean;
  message: string;
}

export interface ArchiveResponse {
  success: boolean;
  message: string;
}

export interface SubreportResponse {
  story_id: string;
  subreport: string;
  generated?: string;
}

export interface CognitiveAnalysisResponse {
  conviction?: number;
  contrarian_angle?: string;
  real_world_opportunities?: any[];
  winners?: any[];
  losers?: any[];
}

export interface OpportunitiesResponse {
  opportunities: any[];
}

export interface WinnersLosersResponse {
  winners: any[];
  losers: any[];
}

export interface ThesisRequest {
  conviction?: number;
  contrarian_angle?: string;
}

export interface ThesisResponse {
  success: boolean;
  message: string;
  story: BackendStory;
}

export interface UserProfileResponse {
  user_id: string;
  risk_tolerance: string;
  capital: number;
  horizon: string;
  description: string;
}

export interface UpdateProfileRequest {
  user_id: string;
  risk_tolerance: string;
  capital_available: number;
  investment_horizon: string;
}

export interface UpdateProfileResponse {
  status: string;
  profile: UserProfileResponse;
}

export interface AnalysisRequest {
  text: string;
}

export interface AnalysisResponse {
  headline: string;
  entities: Record<string, string[]>;
  sentiment: {
    score: number;
    label: string;
  };
  cognitive_analysis: any;
  story_id: string;
  advice: string;
  subreport: string;
  story_context: {
    topic: string;
    maturity: string;
    updates: number;
  };
  user_profile: string;
  message: string;
}

export interface BatchAnalysisRequest {
  texts: string[];
}

export interface BatchAnalysisResponse {
  status: string;
  processed: number;
  results: any[];
}

export interface DecisionLogicResponse {
  Conservative: string;
  Aggressive: string;
  Contrarian: string;
  logic_version: string;
}

export interface PortfolioResponse {
  positions?: any[];
  total_value?: number;
  total_pnl?: number;
  total_pnl_pct?: number;
  cash?: number;
  [key: string]: any;
}

export interface TradeRequest {
  ticker: string;
  sector: string;
  capital_allocation_pct: number;
  entry_price: number;
  story_id?: string;
}

export interface TradeResponse {
  success: boolean;
  message: string;
  warnings?: string[];
}

export interface ClosePositionRequest {
  ticker: string;
  exit_price: number;
}

export interface ClosePositionResponse {
  success: boolean;
  pnl: number;
  pnl_pct: number;
}

export interface RiskAssessmentResponse {
  risk_level?: string;
  risk_factors?: any[];
  mitigation_strategies?: any[];
  [key: string]: any;
}

export interface ExitStrategyResponse {
  exit_triggers?: any[];
  profit_targets?: any[];
  stop_loss_levels?: any[];
  [key: string]: any;
}

export interface CompetitiveAnalysisResponse {
  competitors?: any[];
  market_position?: string;
  competitive_advantages?: any[];
  [key: string]: any;
}

export interface MacroContextResponse {
  economic_indicators?: any[];
  market_conditions?: string;
  sector_outlook?: any[];
  [key: string]: any;
}

export interface MarketTimingResponse {
  timing_score?: number;
  entry_signals?: any[];
  exit_signals?: any[];
  [key: string]: any;
}

export interface SentimentTrendResponse {
  trend?: string;
  sentiment_history?: any[];
  forecast?: string;
  [key: string]: any;
}

export interface PatternValidationResponse {
  patterns?: any[];
  validation_score?: number;
  confidence?: number;
  [key: string]: any;
}

export interface BacktestReportResponse {
  performance_metrics?: any;
  trades?: any[];
  equity_curve?: any[];
  [key: string]: any;
}

export interface FeedbackRequest {
  story_id: string;
  recommendation_id: string;
  followed: boolean;
  result: 'SUCCESS' | 'FAILURE' | 'NEUTRAL';
  actual_return: number;
  user_rating: number;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
}

export interface FeedbackSummaryResponse {
  total_feedback?: number;
  success_rate?: number;
  average_rating?: number;
  [key: string]: any;
}

export interface EntityGraphResponse {
  nodes?: any[];
  edges?: any[];
  [key: string]: any;
}

export interface EntityInfoResponse {
  name?: string;
  type?: string;
  related_entities?: any[];
  stories?: string[];
  [key: string]: any;
}

export interface ImpactChainResponse {
  entity?: string;
  event_type?: string;
  impact_chain?: any[];
  affected_entities?: any[];
  [key: string]: any;
}

export interface ScraperStatusResponse {
  is_running?: boolean;
  config?: {
    interval_minutes?: number;
    runtime_hours?: number;
    auto_start?: boolean;
  };
  last_run?: string;
  next_run?: string;
  [key: string]: any;
}

export interface ScraperConfigRequest {
  interval_minutes?: number;
  runtime_hours?: number;
  auto_start?: boolean;
}

export interface ScraperConfigResponse {
  success: boolean;
  message: string;
  config: ScraperStatusResponse['config'];
}

export interface ScraperStatsResponse {
  total_scraped?: number;
  successful?: number;
  failed?: number;
  avg_time_ms?: number;
  errors?: string[];
  [key: string]: any;
}

export interface AnalysisSummary {
  story_id: string;
  story_title: string;
  timestamp: string;
  has_notes: boolean;
}

export interface AnalysisListResponse {
  success: boolean;
  count: number;
  analyses: AnalysisSummary[];
}

export interface StoredAnalysisResponse {
  success: boolean;
  exists: boolean;
  analysis?: any;
}

// API Service Interface
export interface IApiService {
  // Health & System Status
  healthCheck(): Promise<HealthResponse>;
  getSystemStatus(): Promise<SystemStatusResponse>;

  // Stories Management
  getStories(): Promise<StoriesResponse>;
  getArchivedStories(): Promise<StoriesResponse>;
  refreshStories(): Promise<RefreshResponse>;
  resetSystem(): Promise<ResetResponse>;
  archiveStory(storyId: string): Promise<ArchiveResponse>;

  // Story Details & Analysis
  getSubreport(storyId: string): Promise<SubreportResponse>;
  getCognitiveAnalysis(storyId: string): Promise<CognitiveAnalysisResponse>;
  getOpportunities(storyId: string): Promise<OpportunitiesResponse>;
  getWinnersLosers(storyId: string): Promise<WinnersLosersResponse>;
  updateThesis(storyId: string, data: ThesisRequest): Promise<ThesisResponse>;

  // User Profile
  getProfile(): Promise<UserProfileResponse>;
  updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse>;

  // Analysis
  analyzeText(data: AnalysisRequest): Promise<AnalysisResponse>;
  analyzeBatch(data: BatchAnalysisRequest): Promise<BatchAnalysisResponse>;
  getDecisionLogic(): Promise<DecisionLogicResponse>;

  // Portfolio Management
  getPortfolio(): Promise<PortfolioResponse>;
  executeTrade(data: TradeRequest): Promise<TradeResponse>;
  closePosition(data: ClosePositionRequest): Promise<ClosePositionResponse>;

  // Risk & Exit Strategy
  getRiskAssessment(storyId: string): Promise<RiskAssessmentResponse>;
  getExitStrategy(storyId: string): Promise<ExitStrategyResponse>;

  // Intelligence Layer
  getCompetitiveAnalysis(storyId: string): Promise<CompetitiveAnalysisResponse>;
  getMacroContext(): Promise<MacroContextResponse>;
  getMarketTiming(storyId: string): Promise<MarketTimingResponse>;

  // Validation & Learning
  getSentimentTrend(storyId: string): Promise<SentimentTrendResponse>;
  getPatternValidation(storyId: string): Promise<PatternValidationResponse>;
  getBacktestReport(): Promise<BacktestReportResponse>;
  submitFeedback(data: FeedbackRequest): Promise<FeedbackResponse>;
  getFeedbackSummary(): Promise<FeedbackSummaryResponse>;

  // Entity Graph
  getEntityGraph(): Promise<EntityGraphResponse>;
  getEntityInfo(entityName: string): Promise<EntityInfoResponse>;
  getImpactChain(entityName: string, eventType: 'POSITIVE' | 'NEGATIVE'): Promise<ImpactChainResponse>;

  // Dynamic Scraper Control
  startScraper(): Promise<any>;
  stopScraper(): Promise<any>;
  getScraperStatus(): Promise<ScraperStatusResponse>;
  updateScraperConfig(data: ScraperConfigRequest): Promise<ScraperConfigResponse>;
  getScraperStats(): Promise<ScraperStatsResponse>;
}

// API Client Implementation
export class ApiClient implements IApiService {
  private httpClient: IHttpClient;

  constructor(baseURL: string = BASE_URL) {
    this.httpClient = new FetchHttpClient(baseURL);
  }

  // Health & System Status
  async healthCheck(): Promise<HealthResponse> {
    return this.httpClient.get<HealthResponse>('/api/health');
  }

  async getSystemStatus(): Promise<SystemStatusResponse> {
    return this.httpClient.get<SystemStatusResponse>('/api/status');
  }

  // Stories Management
  async getStories(): Promise<StoriesResponse> {
    return this.httpClient.get<StoriesResponse>('/api/stories');
  }

  async getArchivedStories(): Promise<StoriesResponse> {
    return this.httpClient.get<StoriesResponse>('/api/stories/archived');
  }

  async refreshStories(): Promise<RefreshResponse> {
    return this.httpClient.post<RefreshResponse>('/api/refresh');
  }

  async resetSystem(): Promise<ResetResponse> {
    return this.httpClient.post<ResetResponse>('/api/reset');
  }

  async archiveStory(storyId: string): Promise<ArchiveResponse> {
    return this.httpClient.post<ArchiveResponse>(`/api/stories/${storyId}/archive`);
  }

  // Story Details & Analysis
  async getSubreport(storyId: string): Promise<SubreportResponse> {
    return this.httpClient.get<SubreportResponse>(`/api/stories/${storyId}/subreport`);
  }

  async getCognitiveAnalysis(storyId: string): Promise<CognitiveAnalysisResponse> {
    return this.httpClient.get<CognitiveAnalysisResponse>(`/api/stories/${storyId}/cognitive`);
  }

  async getOpportunities(storyId: string): Promise<OpportunitiesResponse> {
    return this.httpClient.get<OpportunitiesResponse>(`/api/stories/${storyId}/opportunities`);
  }

  async getWinnersLosers(storyId: string): Promise<WinnersLosersResponse> {
    return this.httpClient.get<WinnersLosersResponse>(`/api/stories/${storyId}/winners-losers`);
  }

  async updateThesis(storyId: string, data: ThesisRequest): Promise<ThesisResponse> {
    return this.httpClient.post<ThesisResponse>(`/api/stories/${storyId}/thesis`, data);
  }

  // User Profile
  async getProfile(): Promise<UserProfileResponse> {
    return this.httpClient.get<UserProfileResponse>('/api/profile');
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    return this.httpClient.post<UpdateProfileResponse>('/api/profile', data);
  }

  // Analysis
  async analyzeText(data: AnalysisRequest): Promise<AnalysisResponse> {
    return this.httpClient.post<AnalysisResponse>('/api/analyze', data);
  }

  async analyzeBatch(data: BatchAnalysisRequest): Promise<BatchAnalysisResponse> {
    return this.httpClient.post<BatchAnalysisResponse>('/api/analyze/batch', data);
  }

  async getAnalyses(limit: number = 50): Promise<AnalysisListResponse> {
    return this.httpClient.get<AnalysisListResponse>(`/api/analyses?limit=${limit}`);
  }

  async getAnalysis(storyId: string): Promise<StoredAnalysisResponse> {
    return this.httpClient.get<StoredAnalysisResponse>(`/api/stories/${storyId}/analysis`);
  }

  async getDecisionLogic(): Promise<DecisionLogicResponse> {
    return this.httpClient.get<DecisionLogicResponse>('/api/decision-logic');
  }

  // Portfolio Management
  async getPortfolio(): Promise<PortfolioResponse> {
    return this.httpClient.get<PortfolioResponse>('/api/portfolio');
  }

  async executeTrade(data: TradeRequest): Promise<TradeResponse> {
    return this.httpClient.post<TradeResponse>('/api/portfolio/trade', data);
  }

  async closePosition(data: ClosePositionRequest): Promise<ClosePositionResponse> {
    return this.httpClient.post<ClosePositionResponse>('/api/portfolio/close', data);
  }

  // Risk & Exit Strategy
  async getRiskAssessment(storyId: string): Promise<RiskAssessmentResponse> {
    return this.httpClient.get<RiskAssessmentResponse>(`/api/risk/${storyId}`);
  }

  async getExitStrategy(storyId: string): Promise<ExitStrategyResponse> {
    return this.httpClient.get<ExitStrategyResponse>(`/api/exit-strategy/${storyId}`);
  }

  // Intelligence Layer
  async getCompetitiveAnalysis(storyId: string): Promise<CompetitiveAnalysisResponse> {
    return this.httpClient.get<CompetitiveAnalysisResponse>(`/api/competitive/${storyId}`);
  }

  async getMacroContext(): Promise<MacroContextResponse> {
    return this.httpClient.get<MacroContextResponse>('/api/macro');
  }

  async getMarketTiming(storyId: string): Promise<MarketTimingResponse> {
    return this.httpClient.get<MarketTimingResponse>(`/api/timing/${storyId}`);
  }

  // Validation & Learning
  async getSentimentTrend(storyId: string): Promise<SentimentTrendResponse> {
    return this.httpClient.get<SentimentTrendResponse>(`/api/sentiment-trend/${storyId}`);
  }

  async getPatternValidation(storyId: string): Promise<PatternValidationResponse> {
    return this.httpClient.get<PatternValidationResponse>(`/api/pattern-validation/${storyId}`);
  }

  async getBacktestReport(): Promise<BacktestReportResponse> {
    return this.httpClient.get<BacktestReportResponse>('/api/backtest/report');
  }

  async submitFeedback(data: FeedbackRequest): Promise<FeedbackResponse> {
    return this.httpClient.post<FeedbackResponse>('/api/feedback', data);
  }

  async getFeedbackSummary(): Promise<FeedbackSummaryResponse> {
    return this.httpClient.get<FeedbackSummaryResponse>('/api/feedback/summary');
  }

  // Entity Graph
  async getEntityGraph(): Promise<EntityGraphResponse> {
    return this.httpClient.get<EntityGraphResponse>('/api/entities/graph');
  }

  async getEntityInfo(entityName: string): Promise<EntityInfoResponse> {
    return this.httpClient.get<EntityInfoResponse>(`/api/entities/${encodeURIComponent(entityName)}`);
  }

  async getImpactChain(entityName: string, eventType: 'POSITIVE' | 'NEGATIVE'): Promise<ImpactChainResponse> {
    return this.httpClient.get<ImpactChainResponse>(
      `/api/impact/${encodeURIComponent(entityName)}/${eventType}`
    );
  }

  // Dynamic Scraper Control
  async startScraper(): Promise<any> {
    return this.httpClient.post('/api/scraper/start');
  }

  async stopScraper(): Promise<any> {
    return this.httpClient.post('/api/scraper/stop');
  }

  async getScraperStatus(): Promise<ScraperStatusResponse> {
    return this.httpClient.get<ScraperStatusResponse>('/api/scraper/status');
  }

  async updateScraperConfig(data: ScraperConfigRequest): Promise<ScraperConfigResponse> {
    return this.httpClient.post<ScraperConfigResponse>('/api/scraper/config', data);
  }

  async getScraperStats(): Promise<ScraperStatsResponse> {
    return this.httpClient.get<ScraperStatsResponse>('/api/scraper/stats');
  }
}

// Singleton instance
let apiClientInstance: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient();
  }
  return apiClientInstance;
}

// Reset singleton (useful for testing)
export function resetApiClient(): void {
  apiClientInstance = null;
}

export default getApiClient;
