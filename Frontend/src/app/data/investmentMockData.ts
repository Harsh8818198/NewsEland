import type {
  Story,
  AnalysisResult,
  SystemHealth,
  DashboardStats,
  RecentActivity,
  UserProfile,
} from '@/app/types/investment';

export const mockUserProfile: UserProfile = {
  riskTolerance: 'Conservative',
  capitalAvailable: 50000,
  investmentHorizon: 'Medium',
};

export const mockDashboardStats: DashboardStats = {
  totalStories: 47,
  activeStories: 12,
  newUpdatesToday: 8,
  overallSentiment: 'neutral',
};

export const mockSystemHealth: SystemHealth = {
  ingestion: {
    status: 'healthy',
    lastUpdate: '2 minutes ago',
    articlesProcessed: 1243,
  },
  analysis: {
    status: 'healthy',
    lastUpdate: '1 minute ago',
    analysisCount: 856,
  },
  memory: {
    status: 'healthy',
    lastUpdate: '5 minutes ago',
    storiesTracked: 47,
  },
};

export const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    timestamp: '5 minutes ago',
    type: 'story_updated',
    title: 'Fed signals potential rate pause in Q2 2026',
    sentiment: 'neutral',
  },
  {
    id: '2',
    timestamp: '12 minutes ago',
    type: 'analysis_completed',
    title: 'Analysis: AI chip shortage implications',
  },
  {
    id: '3',
    timestamp: '23 minutes ago',
    type: 'new_story',
    title: 'New Story: European regulatory changes',
    sentiment: 'negative',
  },
  {
    id: '4',
    timestamp: '1 hour ago',
    type: 'story_updated',
    title: 'Tech earnings season outlook updated',
    sentiment: 'positive',
  },
  {
    id: '5',
    timestamp: '2 hours ago',
    type: 'analysis_completed',
    title: 'Analysis: Energy sector consolidation',
  },
];

export const mockStories: Story[] = [
  {
    id: 'story-1',
    title: 'Federal Reserve monetary policy trajectory',
    summary:
      'Ongoing analysis of Federal Reserve communications regarding interest rate policy and inflation targets through 2026.',
    maturity: 'Mature',
    updateCount: 23,
    sentiment: 'neutral',
    topic: 'Monetary Policy',
    lastUpdated: '5 minutes ago',
    sentimentHistory: [
      { date: 'Jan 15', value: -0.2, sentiment: 'negative' },
      { date: 'Jan 20', value: -0.1, sentiment: 'neutral' },
      { date: 'Jan 25', value: 0.0, sentiment: 'neutral' },
      { date: 'Jan 30', value: 0.1, sentiment: 'neutral' },
      { date: 'Feb 3', value: 0.0, sentiment: 'neutral' },
    ],
    updates: [
      {
        id: 'u1',
        timestamp: '5 minutes ago',
        headline: 'Powell reiterates commitment to 2% inflation target',
        sentiment: 'neutral',
      },
      {
        id: 'u2',
        timestamp: '2 hours ago',
        headline: 'Market reprices rate cut expectations',
        sentiment: 'negative',
      },
      {
        id: 'u3',
        timestamp: '1 day ago',
        headline: 'FOMC minutes reveal divided committee',
        sentiment: 'neutral',
      },
    ],
    relatedEntities: ['Federal Reserve', 'Jerome Powell', 'FOMC', 'Inflation', 'Interest Rates'],
  },
  {
    id: 'story-2',
    title: 'AI chip supply constraints and competitive dynamics',
    summary:
      'Tracking semiconductor capacity issues at advanced nodes and their impact on AI infrastructure deployment.',
    maturity: 'Developing',
    updateCount: 7,
    sentiment: 'negative',
    topic: 'Technology',
    lastUpdated: '45 minutes ago',
    sentimentHistory: [
      { date: 'Jan 20', value: 0.1, sentiment: 'positive' },
      { date: 'Jan 25', value: -0.2, sentiment: 'negative' },
      { date: 'Jan 30', value: -0.3, sentiment: 'negative' },
      { date: 'Feb 3', value: -0.4, sentiment: 'negative' },
    ],
    updates: [
      {
        id: 'u4',
        timestamp: '45 minutes ago',
        headline: 'TSMC extends lead times for 3nm processes',
        sentiment: 'negative',
      },
      {
        id: 'u5',
        timestamp: '6 hours ago',
        headline: 'Hyperscalers lock in long-term capacity agreements',
        sentiment: 'neutral',
      },
    ],
    relatedEntities: ['TSMC', 'Samsung', 'AI Infrastructure', 'Semiconductors', 'Cloud Computing'],
  },
  {
    id: 'story-3',
    title: 'European AI regulation implementation timeline',
    summary:
      'EU AI Act enforcement phases and compliance requirements for companies operating in European markets.',
    maturity: 'Mature',
    updateCount: 15,
    sentiment: 'negative',
    topic: 'Regulation',
    lastUpdated: '3 hours ago',
    sentimentHistory: [
      { date: 'Jan 10', value: -0.3, sentiment: 'negative' },
      { date: 'Jan 20', value: -0.4, sentiment: 'negative' },
      { date: 'Jan 30', value: -0.5, sentiment: 'negative' },
      { date: 'Feb 3', value: -0.4, sentiment: 'negative' },
    ],
    updates: [
      {
        id: 'u6',
        timestamp: '3 hours ago',
        headline: 'Technical standards published for high-risk AI systems',
        sentiment: 'negative',
      },
    ],
    relatedEntities: ['European Commission', 'EU AI Act', 'Regulation', 'Compliance'],
  },
  {
    id: 'story-4',
    title: 'Enterprise technology spending patterns 2026',
    summary:
      'CIO budget priorities shifting from expansion to efficiency and vendor consolidation.',
    maturity: 'Developing',
    updateCount: 9,
    sentiment: 'neutral',
    topic: 'Technology',
    lastUpdated: '1 day ago',
    sentimentHistory: [
      { date: 'Jan 15', value: 0.2, sentiment: 'positive' },
      { date: 'Jan 25', value: 0.1, sentiment: 'neutral' },
      { date: 'Feb 3', value: 0.0, sentiment: 'neutral' },
    ],
    updates: [
      {
        id: 'u7',
        timestamp: '1 day ago',
        headline: 'Gartner survey shows 68% prioritize cost reduction',
        sentiment: 'neutral',
      },
    ],
    relatedEntities: ['Enterprise Software', 'SaaS', 'Technology Spending', 'Gartner'],
  },
  {
    id: 'story-5',
    title: 'Renewable energy sector consolidation wave',
    summary: 'M&A activity accelerating in solar and wind sectors as scale becomes competitive advantage.',
    maturity: 'Developing',
    updateCount: 5,
    sentiment: 'positive',
    topic: 'Energy',
    lastUpdated: '2 days ago',
    sentimentHistory: [
      { date: 'Jan 20', value: 0.3, sentiment: 'positive' },
      { date: 'Jan 30', value: 0.4, sentiment: 'positive' },
      { date: 'Feb 3', value: 0.5, sentiment: 'positive' },
    ],
    updates: [
      {
        id: 'u8',
        timestamp: '2 days ago',
        headline: 'Major solar company announces strategic acquisition',
        sentiment: 'positive',
      },
    ],
    relatedEntities: ['Renewable Energy', 'Solar', 'M&A', 'Energy Sector'],
  },
  {
    id: 'story-6',
    title: 'Healthcare AI diagnostic tool adoption',
    summary: 'Hospitals and health systems increasing investment in AI-powered diagnostic platforms.',
    maturity: 'Developing',
    updateCount: 4,
    sentiment: 'positive',
    topic: 'Healthcare',
    lastUpdated: '3 days ago',
    sentimentHistory: [
      { date: 'Jan 25', value: 0.2, sentiment: 'positive' },
      { date: 'Feb 3', value: 0.3, sentiment: 'positive' },
    ],
    updates: [
      {
        id: 'u9',
        timestamp: '3 days ago',
        headline: 'FDA approves new AI imaging diagnostic system',
        sentiment: 'positive',
      },
    ],
    relatedEntities: ['Healthcare', 'AI Diagnostics', 'FDA', 'Medical Technology'],
  },
];

export const mockAnalysisHistory: AnalysisResult[] = [
  {
    id: 'analysis-1',
    timestamp: '12 minutes ago',
    inputText: 'AI chip shortage worsens as demand from hyperscalers continues to surge',
    entities: ['AI', 'Semiconductors', 'Hyperscalers'],
    sentiment: 'negative',
    sentimentScore: -0.6,
    storyContext: 'AI chip supply constraints and competitive dynamics',
    personalizedAdvice:
      'Given your conservative risk profile, avoid new positions in semiconductor equipment manufacturers at current valuations. The supply constraints create near-term uncertainty that conflicts with your risk tolerance.',
  },
  {
    id: 'analysis-2',
    timestamp: '2 hours ago',
    inputText: 'Solar energy company announces major acquisition to expand capacity',
    entities: ['Solar', 'Renewable Energy', 'M&A'],
    sentiment: 'positive',
    sentimentScore: 0.7,
    storyContext: 'Renewable energy sector consolidation wave',
    personalizedAdvice:
      'This consolidation trend aligns with medium-term investment horizons. Consider established renewable energy firms with strong balance sheets. The sector shows positive momentum with regulatory tailwinds.',
  },
];

export function getStoryById(id: string): Story | undefined {
  return mockStories.find((story) => story.id === id);
}
