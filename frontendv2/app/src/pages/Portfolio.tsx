import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, AlertCircle, RefreshCw, Target,
  Shield, ArrowUpRight, ArrowDownRight, ExternalLink, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApiClient, ApiError } from '@/services/api';
import type {
  EnhancedPortfolioResponse,
  PortfolioAlertsResponse,
  InvestmentOpportunitiesResponse,
  EnhancedPosition,
  PortfolioAlert,
  InvestmentOpportunity
} from '@/services/api';
import { toast } from 'sonner';

// AI Signal Badge Component
function AISignalBadge({ signal }: { signal?: 'BUY' | 'HOLD' | 'EXIT' | 'WATCH' }) {
  const config = {
    BUY: { color: 'text-[#006400]', bg: 'bg-[#006400]/10', label: '🎯 BUY', icon: TrendingUp },
    HOLD: { color: 'text-[#1a1a1a]', bg: 'bg-[#1a1a1a]/10', label: '✋ HOLD', icon: Shield },
    EXIT: { color: 'text-[#8b0000]', bg: 'bg-[#8b0000]/10', label: '⚠️ EXIT', icon: TrendingDown },
    WATCH: { color: 'text-[#6b6b6b]', bg: 'bg-[#6b6b6b]/10', label: '👁️ WATCH', icon: AlertCircle },
  };

  const style = config[signal || 'WATCH'];
  const Icon = style.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${style.bg} ${style.color} text-xs font-bold font-serif`}>
      <Icon className="h-3 w-3" />
      {style.label}
    </div>
  );
}

// Risk Level Badge Component
function RiskBadge({ level }: { level?: 'LOW' | 'MEDIUM' | 'HIGH' }) {
  const config = {
    LOW: { color: 'text-[#006400]', label: 'LOW' },
    MEDIUM: { color: 'text-[#6b6b6b]', label: 'MED' },
    HIGH: { color: 'text-[#8b0000]', label: 'HIGH' },
  };

  const style = config[level || 'MEDIUM'];

  return (
    <span className={`text-xs font-bold ${style.color}`}>
      {style.label}
    </span>
  );
}

// Sentiment Trend Icon
function SentimentTrendIcon({ trend }: { trend?: 'IMPROVING' | 'DECLINING' | 'STABLE' }) {
  if (trend === 'IMPROVING') return <TrendingUp className="h-3 w-3 text-[#006400]" />;
  if (trend === 'DECLINING') return <TrendingDown className="h-3 w-3 text-[#8b0000]" />;
  return <span className="text-xs text-[#6b6b6b]">—</span>;
}

export function Portfolio() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<EnhancedPortfolioResponse | null>(null);
  const [alerts, setAlerts] = useState<PortfolioAlertsResponse | null>(null);
  const [opportunities, setOpportunities] = useState<InvestmentOpportunitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();

      // Fetch all data in parallel
      const [portfolioData, alertsData, opportunitiesData] = await Promise.all([
        api.getEnhancedPortfolio(),
        api.getPortfolioAlerts(),
        api.getInvestmentOpportunities(),
      ]);

      setPortfolio(portfolioData);
      setAlerts(alertsData);
      setOpportunities(opportunitiesData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
      } else {
        setError('Failed to load portfolio data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Portfolio refreshed');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const positions: EnhancedPosition[] = portfolio?.positions || [];
  const totalValue = portfolio?.total_value || 0;
  const totalPnl = portfolio?.total_pnl || 0;
  const totalPnlPct = portfolio?.total_pnl_pct || 0;
  const cash = portfolio?.cash || 0;
  const alertsList: PortfolioAlert[] = alerts?.alerts || [];
  const opportunitiesList: InvestmentOpportunity[] = opportunities?.opportunities || [];

  // Count critical alerts
  const criticalAlerts = alertsList.filter(a => a.severity === 'CRITICAL').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b-4 border-[#1a1a1a] pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Zap className="h-8 w-8 text-[#1a1a1a]" />
          <h1 className="headline-main text-center">Investment War Room</h1>
          <Zap className="h-8 w-8 text-[#1a1a1a]" />
        </div>
        <p className="text-center font-serif text-[#6b6b6b] mt-2 italic">
          AI-Powered Command Center for Story-Driven Investing
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-[#8b0000]/10 border-[#8b0000] text-[#8b0000]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      {/* Command Center Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border-2 border-[#1a1a1a] p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Total Value</p>
          <p className="text-3xl font-bold font-serif text-[#1a1a1a]">
            ${totalValue.toLocaleString()}
          </p>
          <p className="text-xs text-[#6b6b6b] font-serif mt-1">Assets Under Management</p>
        </div>

        <div className="border-2 border-[#1a1a1a] p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Total P&L</p>
          <p className={`text-3xl font-bold font-serif ${totalPnl >= 0 ? 'text-[#006400]' : 'text-[#8b0000]'}`}>
            {totalPnl >= 0 ? '+' : ''}${Math.abs(totalPnl).toLocaleString()}
          </p>
          <p className={`text-xs font-serif mt-1 ${totalPnlPct >= 0 ? 'text-[#006400]' : 'text-[#8b0000]'}`}>
            {totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%
          </p>
        </div>

        <div className="border-2 border-[#1a1a1a] p-4 text-center bg-[#8b0000]/5">
          <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Active Alerts</p>
          <p className="text-3xl font-bold font-serif text-[#8b0000]">
            {alertsList.length}
          </p>
          <p className="text-xs text-[#8b0000] font-serif mt-1">
            {criticalAlerts} Critical
          </p>
        </div>

        <div className="border-2 border-[#1a1a1a] p-4 text-center bg-[#006400]/5">
          <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Opportunities</p>
          <p className="text-3xl font-bold font-serif text-[#006400]">
            {opportunitiesList.length}
          </p>
          <p className="text-xs text-[#006400] font-serif mt-1">
            Actionable Stories
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Positions Table - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Positions */}
          <div className="border-2 border-[#1a1a1a] p-6">
            <div className="flex items-center justify-between mb-4 border-b-2 border-[#1a1a1a] pb-3">
              <h4 className="uppercase tracking-wider text-sm font-serif font-bold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Active Positions
              </h4>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-newspaper text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 w-full bg-[#ede8d8] animate-pulse" />
                ))}
              </div>
            ) : positions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="newspaper-table">
                  <thead>
                    <tr>
                      <th>Ticker</th>
                      <th>Story</th>
                      <th>Sentiment</th>
                      <th className="text-right">P&L</th>
                      <th>AI Signal</th>
                      <th>Risk</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position) => (
                      <tr key={position.ticker}>
                        <td className="font-bold">{position.ticker}</td>
                        <td>
                          {position.story_id ? (
                            <button
                              onClick={() => navigate(`/stories/${position.story_id}`)}
                              className="text-left hover:underline text-[#1a1a1a] font-serif text-sm max-w-[200px] truncate block"
                            >
                              {position.story_title}
                            </button>
                          ) : (
                            <span className="text-[#6b6b6b] text-xs italic">No Story</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <span className={`text-xs font-serif ${position.current_sentiment?.label === 'Bullish' ? 'text-[#006400]' :
                                position.current_sentiment?.label === 'Bearish' ? 'text-[#8b0000]' :
                                  'text-[#6b6b6b]'
                              }`}>
                              {position.current_sentiment?.label || 'N/A'}
                            </span>
                            <SentimentTrendIcon trend={position.current_sentiment?.trend} />
                          </div>
                        </td>
                        <td className="text-right">
                          <div className={`flex items-center justify-end gap-1 ${position.pnl >= 0 ? 'text-[#006400]' : 'text-[#8b0000]'}`}>
                            {position.pnl >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            <span className="font-bold">${Math.abs(position.pnl).toLocaleString()}</span>
                            <span className="text-xs">
                              ({position.pnl >= 0 ? '+' : ''}{position.pnl_pct.toFixed(1)}%)
                            </span>
                          </div>
                        </td>
                        <td>
                          <AISignalBadge signal={position.ai_signal} />
                        </td>
                        <td>
                          <RiskBadge level={position.risk_level} />
                        </td>
                        <td>
                          {position.story_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/stories/${position.story_id}`)}
                              className="text-xs"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-[#6b6b6b] mx-auto mb-4" />
                <h3 className="headline-tertiary mb-2">No Active Positions</h3>
                <p className="font-serif text-[#4a4a4a]">Your war room awaits deployment</p>
              </div>
            )}
          </div>

          {/* Opportunity Radar */}
          <div className="border-2 border-[#006400] p-6 bg-[#006400]/5">
            <h4 className="uppercase tracking-wider text-sm font-serif font-bold border-b-2 border-[#006400] pb-3 mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#006400]" />
              Opportunity Radar
            </h4>
            {opportunitiesList.length > 0 ? (
              <div className="space-y-3">
                {opportunitiesList.slice(0, 5).map((opp) => (
                  <div key={opp.story_id} className="border border-[#1a1a1a] p-3 bg-[#f5f2e9]">
                    <div className="flex items-start justify-between mb-2">
                      <button
                        onClick={() => navigate(`/stories/${opp.story_id}`)}
                        className="font-serif font-bold text-sm hover:underline text-left flex-1"
                      >
                        {opp.story_title}
                      </button>
                      <span className="tag-newspaper text-xs ml-2">{opp.confidence}%</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-serif text-[#6b6b6b]">
                      <span className={opp.sentiment.label === 'Bullish' ? 'text-[#006400]' : 'text-[#8b0000]'}>
                        {opp.sentiment.label}
                      </span>
                      <span>•</span>
                      <span>{opp.suggested_ticker}</span>
                      <span>•</span>
                      <span>{opp.suggested_allocation_pct}% suggested</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/stories/${opp.story_id}`)}
                      className="mt-2 text-xs btn-newspaper"
                    >
                      Analyze Story
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center font-serif text-[#6b6b6b] py-4">
                No opportunities detected
              </p>
            )}
          </div>
        </div>

        {/* Sidebar - Alerts & Info */}
        <div className="space-y-6">
          {/* Active Alerts */}
          <div className="border-2 border-[#8b0000] p-4 bg-[#8b0000]/5">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b-2 border-[#8b0000] pb-2 mb-4">
              ⚠️ Active Alerts
            </h4>
            {alertsList.length > 0 ? (
              <div className="space-y-3">
                {alertsList.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`border p-3 ${alert.severity === 'CRITICAL' ? 'border-[#8b0000] bg-[#8b0000]/10' :
                        alert.severity === 'WARNING' ? 'border-[#d4a000] bg-[#d4a000]/10' :
                          'border-[#1a1a1a] bg-[#f5f2e9]'
                      }`}
                  >
                    <p className="font-serif text-xs font-bold mb-1">{alert.ticker}</p>
                    <p className="font-serif text-xs text-[#4a4a4a] mb-2">{alert.message}</p>
                    {alert.action_required && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/stories/${alert.story_id}`)}
                        className="text-xs btn-newspaper w-full"
                      >
                        Review Story
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center font-serif text-[#6b6b6b] text-sm py-4">
                All clear ✅
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="border border-[#1a1a1a] p-4">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
              Quick Stats
            </h4>
            <div className="space-y-2 text-sm font-serif">
              <div className="flex justify-between">
                <span className="text-[#6b6b6b]">Cash Reserve:</span>
                <span className="font-bold">${cash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b6b6b]">Positions:</span>
                <span className="font-bold">{positions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b6b6b]">Alerts:</span>
                <span className="font-bold text-[#8b0000]">{alertsList.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b6b6b]">Opportunities:</span>
                <span className="font-bold text-[#006400]">{opportunitiesList.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
