import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApiClient, ApiError } from '@/services/api';
import type { BackendStory, SystemStatusResponse, PortfolioResponse } from '@/services/api';
import { BacktestWidget } from '@/components/BacktestWidget';
import { toast } from 'sonner';

function StoryCard({ story }: { story: BackendStory }) {
  const sentimentIcons = {
    Bullish: <TrendingUp className="h-4 w-4 text-[#006400]" />,
    Bearish: <TrendingDown className="h-4 w-4 text-[#8b0000]" />,
    Neutral: <Minus className="h-4 w-4 text-[#4a4a4a]" />,
  };

  const maturityLabels = {
    DEVELOPING: 'Developing Story',
    MATURE: 'Mature Analysis',
    ACTIONABLE: 'Actionable Insight',
  };

  return (
    <article className="group">
      <Link to={`/stories/${story.id}`} className="block">
        <div className="border-b border-[#1a1a1a] pb-4 mb-4 group-hover:bg-[#ede8d8] transition-colors p-2 -mx-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="tag-newspaper bg-[#1a1a1a] text-[#f5f2e9]">
              {maturityLabels[story.maturity]}
            </span>
            <span className="flex items-center gap-1 text-sm font-serif">
              {sentimentIcons[story.current_hypothesis?.sentiment_label || 'Neutral']}
              <span className={`
                ${story.current_hypothesis?.sentiment_label === 'Bullish' ? 'text-[#006400]' : ''}
                ${story.current_hypothesis?.sentiment_label === 'Bearish' ? 'text-[#8b0000]' : ''}
              `}>
                {story.current_hypothesis?.sentiment_label || 'Neutral'}
              </span>
            </span>
          </div>
          <h3 className="headline-tertiary mb-2 group-hover:underline">
            {story.main_topic}
          </h3>
          <p className="article-text text-sm text-[#4a4a4a] line-clamp-2">
            {story.current_hypothesis?.expected_impact || 'Analysis in progress...'}
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs text-[#6b6b6b] font-serif">
            <span>{story.updates_count} updates</span>
            <span>{new Date(story.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function StatBox({ label, value, subtext, trend }: { label: string; value: string; subtext?: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="border border-[#1a1a1a] p-4 text-center">
      <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">{label}</p>
      <p className={`text-2xl font-bold font-serif ${trend === 'up' ? 'text-[#006400]' : trend === 'down' ? 'text-[#8b0000]' : 'text-[#1a1a1a]'}`}>
        {value}
      </p>
      {subtext && <p className="text-xs text-[#6b6b6b] font-serif mt-1">{subtext}</p>}
    </div>
  );
}

export function Dashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [stories, setStories] = useState<BackendStory[]>([]);
  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();

      const [statusData, portfolioData, storiesData] = await Promise.all([
        api.getSystemStatus(),
        api.getPortfolio(),
        api.getStories(),
      ]);

      setSystemStatus(statusData);
      setPortfolio(portfolioData);
      setStories(storiesData.stories.filter(s => s.status === 'ACTIVE').slice(0, 6));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const api = getApiClient();
      const result = await api.refreshStories();
      toast.success(`Found ${result.articles_found} articles, created ${result.new_stories} new stories`);
      await fetchData();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.userMessage);
      } else {
        toast.error('Failed to refresh stories');
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalValue = portfolio?.total_value || 0;
  const totalPnl = portfolio?.total_pnl || 0;
  const pnlPct = portfolio?.total_pnl_pct || 0;
  const actionableCount = stories.filter(s => s.maturity === 'ACTIONABLE').length;

  return (
    <div className="space-y-8">
      {/* Error Alert */}
      {error && (
        <Alert className="bg-[#8b0000]/10 border-[#8b0000] text-[#8b0000]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      {/* Front Page Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-8">
          {/* Breaking News Banner */}
          <div className="border-2 border-[#1a1a1a] p-1 mb-6">
            <div className="bg-[#1a1a1a] text-[#f5f2e9] px-4 py-2 text-center">
              <span className="text-sm uppercase tracking-[0.3em] font-serif font-bold">
                Latest Market Intelligence
              </span>
            </div>
          </div>

          {/* Main Headline Story */}
          {stories.length > 0 && (
            <article className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="tag-newspaper border-[#8b0000] text-[#8b0000]">
                  Lead Story
                </span>
                <span className="text-sm font-serif text-[#6b6b6b]">
                  {new Date(stories[0].created_at).toLocaleDateString()}
                </span>
              </div>
              <Link to={`/stories/${stories[0].id}`}>
                <h2 className="headline-main mb-4 hover:underline">
                  {stories[0].main_topic}
                </h2>
              </Link>
              <p className="article-text text-lg mb-4">
                {stories[0].current_hypothesis?.expected_impact ||
                  'Market analysis indicates significant developments in this sector. Our AI systems are tracking multiple data points to provide comprehensive investment insights.'}
              </p>
              <div className="flex items-center gap-4 text-sm font-serif">
                <span className="flex items-center gap-1">
                  {stories[0].current_hypothesis?.sentiment_label === 'Bullish' ? (
                    <TrendingUp className="h-4 w-4 text-[#006400]" />
                  ) : stories[0].current_hypothesis?.sentiment_label === 'Bearish' ? (
                    <TrendingDown className="h-4 w-4 text-[#8b0000]" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                  <span className={`
                    ${stories[0].current_hypothesis?.sentiment_label === 'Bullish' ? 'text-[#006400]' : ''}
                    ${stories[0].current_hypothesis?.sentiment_label === 'Bearish' ? 'text-[#8b0000]' : ''}
                  `}>
                    {stories[0].current_hypothesis?.sentiment_label || 'Neutral'} Sentiment
                  </span>
                </span>
                <span className="text-[#6b6b6b]">|</span>
                <span className="text-[#4a4a4a]">{stories[0].updates_count} Updates</span>
                <span className="text-[#6b6b6b]">|</span>
                <Link to={`/stories/${stories[0].id}`} className="text-[#00008b] hover:underline">
                  Continue Reading &rarr;
                </Link>
              </div>
            </article>
          )}

          {/* Market Briefs Section */}
          <div className="border-t-2 border-[#1a1a1a] pt-6">
            <h3 className="section-header">Market Briefs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {stories.slice(1, 5).map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Market Snapshot */}
          <div className="border-2 border-[#1a1a1a] p-4">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
              Market Snapshot
            </h4>
            <div className="space-y-3">
              <StatBox
                label="Portfolio Value"
                value={`$${totalValue.toLocaleString()}`}
                subtext="Total Assets Under Management"
              />
              <StatBox
                label="Total P&L"
                value={`${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toLocaleString()}`}
                subtext={`${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`}
                trend={totalPnl >= 0 ? 'up' : 'down'}
              />
              <StatBox
                label="Active Stories"
                value={stories.length.toString()}
                subtext={`${actionableCount} Actionable`}
              />
              <StatBox
                label="Stories Tracked"
                value={(systemStatus?.stories_tracked || 0).toString()}
                subtext="By AI System"
              />
            </div>
          </div>

          {/* Backtest Performance Widget */}
          <BacktestWidget />

          {/* System Status */}
          <div className="border border-[#1a1a1a] p-4">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
              System Status
            </h4>
            {systemStatus && (
              <div className="space-y-2 text-sm font-serif">
                {Object.entries(systemStatus.brains).map(([name, status]) => (
                  <div key={name} className="flex justify-between items-center">
                    <span className="capitalize text-[#4a4a4a]">{name}</span>
                    <span className={`text-xs uppercase ${status === 'active' || status === 'healthy' ? 'text-[#006400]' : 'text-[#8b0000]'
                      }`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="border border-[#1a1a1a] p-4">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
              Editor&apos;s Desk
            </h4>
            <div className="space-y-2">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full btn-newspaper"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh News
              </Button>
              <Button asChild className="w-full btn-newspaper">
                <Link to="/analyzer">
                  Analyze Headline
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full btn-newspaper">
                <Link to="/portfolio">
                  View Portfolio
                </Link>
              </Button>
            </div>
          </div>

          {/* Classifieds-style Info */}
          <div className="border border-[#1a1a1a] p-4 bg-[#ede8d8]">
            <h4 className="text-center uppercase tracking-wider text-xs font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-3">
              About This Edition
            </h4>
            <p className="text-xs font-serif text-[#4a4a4a] leading-relaxed text-center">
              The Financial Chronicle uses advanced artificial intelligence to analyze
              market news, track investment narratives, and provide actionable insights
              for informed decision-making.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
