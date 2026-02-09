import { useState, useEffect } from 'react';
import {
  TrendingUp, DollarSign, Clock, Save, RefreshCw, AlertCircle, Shield,
  CheckCircle2, Target, Zap, Brain, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApiClient, ApiError } from '@/services/api';
import type { UserProfileResponse, PortfolioResponse } from '@/services/api';
import { toast } from 'sonner';

type RiskTolerance = 'Conservative' | 'Moderate' | 'Aggressive';
type InvestmentHorizon = 'Short-term' | 'Medium-term' | 'Long-term';

export function Profile() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('Moderate');
  const [capital, setCapital] = useState<number>(100000);
  const [horizon, setHorizon] = useState<InvestmentHorizon>('Medium-term');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();

      // Fetch profile and portfolio in parallel
      const [profileData, portfolioData] = await Promise.all([
        api.getProfile(),
        api.getPortfolio().catch(() => null), // Portfolio might be empty
      ]);

      setProfile(profileData);
      setPortfolio(portfolioData);
      setRiskTolerance((profileData.risk_tolerance as RiskTolerance) || 'Moderate');
      setCapital(profileData.capital || 100000);
      setHorizon((profileData.horizon as InvestmentHorizon) || 'Medium-term');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const api = getApiClient();
      await api.updateProfile({
        user_id: profile?.user_id || 'default',
        risk_tolerance: riskTolerance,
        capital_available: capital,
        investment_horizon: horizon,
      });
      toast.success('Profile updated successfully');
      await fetchData();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.userMessage);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const riskDescriptions = {
    Conservative: 'Focus on capital preservation with minimal risk. Lower allocation percentages.',
    Moderate: 'Balanced approach with moderate risk and return. Standard allocations.',
    Aggressive: 'Higher risk tolerance for potentially greater returns. Larger position sizes.',
  };

  const horizonDescriptions = {
    'Short-term': 'Less than 1 year. Focus on quick opportunities and momentum plays.',
    'Medium-term': '1-3 years. Balanced approach with growth and value stories.',
    'Long-term': '3+ years. Patient capital for transformative stories and trends.',
  };

  // Calculate portfolio stats
  const totalValue = portfolio?.total_value || 0;
  const totalPnl = portfolio?.total_pnl || 0;
  const totalPnlPct = portfolio?.total_pnl_pct || 0;
  const activePositions = portfolio?.positions?.length || 0;
  const deployedCapital = totalValue - (portfolio?.cash || 0);
  const deploymentRate = capital > 0 ? (deployedCapital / capital) * 100 : 0;

  // Get AI insights based on profile
  const getAIInsights = () => {
    const insights = [];

    if (deploymentRate < 30) {
      insights.push({
        icon: Target,
        title: 'Low Deployment',
        message: `Only ${deploymentRate.toFixed(0)}% of capital deployed. Consider exploring opportunities.`,
        type: 'info'
      });
    }

    if (riskTolerance === 'Conservative' && totalPnlPct < -5) {
      insights.push({
        icon: Shield,
        title: 'Risk Alert',
        message: 'Conservative profile with negative returns. Review positions for risk management.',
        type: 'warning'
      });
    }

    if (riskTolerance === 'Aggressive' && activePositions < 3) {
      insights.push({
        icon: Zap,
        title: 'Diversification',
        message: 'Aggressive profile with few positions. Consider diversifying for better risk-adjusted returns.',
        type: 'info'
      });
    }

    if (totalPnlPct > 15) {
      insights.push({
        icon: Award,
        title: 'Strong Performance',
        message: `Excellent returns of ${totalPnlPct.toFixed(1)}%! Your strategy is working well.`,
        type: 'success'
      });
    }

    return insights;
  };

  const aiInsights = getAIInsights();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b-4 border-[#1a1a1a] pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-[#1a1a1a]" />
          <h1 className="headline-main text-center">Investor Profile</h1>
          <Brain className="h-8 w-8 text-[#1a1a1a]" />
        </div>
        <p className="text-center font-serif text-[#6b6b6b] mt-2 italic">
          Your Investment DNA & Performance Dashboard
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-[#8b0000]/10 border-[#8b0000] text-[#8b0000]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      {/* Performance Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border-2 border-[#1a1a1a] p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Portfolio Value</p>
          <p className="text-2xl font-bold font-serif text-[#1a1a1a]">
            ${totalValue.toLocaleString()}
          </p>
          <p className="text-xs text-[#6b6b6b] font-serif mt-1">Current Holdings</p>
        </div>

        <div className="border-2 border-[#1a1a1a] p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Total Return</p>
          <p className={`text-2xl font-bold font-serif ${totalPnl >= 0 ? 'text-[#006400]' : 'text-[#8b0000]'}`}>
            {totalPnl >= 0 ? '+' : ''}${Math.abs(totalPnl).toLocaleString()}
          </p>
          <p className={`text-xs font-serif mt-1 ${totalPnlPct >= 0 ? 'text-[#006400]' : 'text-[#8b0000]'}`}>
            {totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%
          </p>
        </div>

        <div className="border-2 border-[#1a1a1a] p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Deployment</p>
          <p className="text-2xl font-bold font-serif text-[#1a1a1a]">
            {deploymentRate.toFixed(0)}%
          </p>
          <p className="text-xs text-[#6b6b6b] font-serif mt-1">Capital Deployed</p>
        </div>

        <div className="border-2 border-[#1a1a1a] p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Positions</p>
          <p className="text-2xl font-bold font-serif text-[#1a1a1a]">
            {activePositions}
          </p>
          <p className="text-xs text-[#6b6b6b] font-serif mt-1">Active Holdings</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Profile Card */}
          {profile && (
            <div className="border-2 border-[#1a1a1a] p-6 bg-[#ede8d8]">
              <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b-2 border-[#1a1a1a] pb-3 mb-4">
                Current Profile
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Risk Tolerance</p>
                  <span className={`tag-newspaper inline-block ${profile.risk_tolerance === 'Conservative' ? 'bg-[#006400] text-[#f5f2e9]' :
                    profile.risk_tolerance === 'Moderate' ? 'bg-[#b8860b] text-[#f5f2e9]' :
                      'bg-[#8b0000] text-[#f5f2e9]'
                    }`}>
                    {profile.risk_tolerance}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Capital Available</p>
                  <p className="text-xl font-bold font-serif">${profile.capital.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Investment Horizon</p>
                  <span className="tag-newspaper inline-block">{profile.horizon}</span>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile */}
          <div className="border-2 border-[#1a1a1a] p-6">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b-2 border-[#1a1a1a] pb-3 mb-6">
              Edit Profile Settings
            </h4>

            {/* Risk Tolerance */}
            <div className="space-y-3 mb-6">
              <Label className="text-sm font-serif font-bold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Risk Tolerance
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Conservative', 'Moderate', 'Aggressive'] as RiskTolerance[]).map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setRiskTolerance(risk)}
                    className={`p-4 border-2 text-left transition-all ${riskTolerance === risk
                      ? 'border-[#1a1a1a] bg-[#ede8d8]'
                      : 'border-[#d4d0c0] hover:border-[#1a1a1a]'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-serif font-bold ${riskTolerance === risk ? 'text-[#1a1a1a]' : 'text-[#6b6b6b]'}`}>
                        {risk}
                      </span>
                      {riskTolerance === risk && <CheckCircle2 className="h-4 w-4 text-[#1a1a1a]" />}
                    </div>
                    <p className="text-xs font-serif text-[#6b6b6b]">{riskDescriptions[risk]}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Capital */}
            <div className="space-y-3 mb-6 border-t border-[#ede8d8] pt-6">
              <Label className="text-sm font-serif font-bold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Capital Available
              </Label>
              <div className="relative max-w-md">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
                <Input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(parseInt(e.target.value) || 0)}
                  className="pl-10 newspaper-input"
                />
              </div>
              <p className="text-xs font-serif text-[#6b6b6b]">
                Total capital available for investment decisions. This affects position sizing recommendations.
              </p>
            </div>

            {/* Investment Horizon */}
            <div className="space-y-3 mb-6 border-t border-[#ede8d8] pt-6">
              <Label className="text-sm font-serif font-bold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Investment Horizon
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Short-term', 'Medium-term', 'Long-term'] as InvestmentHorizon[]).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`p-4 border-2 text-left transition-all ${horizon === h
                      ? 'border-[#1a1a1a] bg-[#ede8d8]'
                      : 'border-[#d4d0c0] hover:border-[#1a1a1a]'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-serif font-bold ${horizon === h ? 'text-[#1a1a1a]' : 'text-[#6b6b6b]'}`}>
                        {h}
                      </span>
                      {horizon === h && <CheckCircle2 className="h-4 w-4 text-[#1a1a1a]" />}
                    </div>
                    <p className="text-xs font-serif text-[#6b6b6b]">{horizonDescriptions[h]}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-4 border-t border-[#ede8d8] pt-6">
              <Button
                variant="outline"
                onClick={fetchData}
                disabled={loading}
                className="btn-newspaper"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="btn-newspaper bg-[#1a1a1a] text-[#f5f2e9]"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - AI Insights & Stats */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="border-2 border-[#1a1a1a] p-4 bg-[#ede8d8]">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b-2 border-[#1a1a1a] pb-2 mb-4 flex items-center justify-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </h4>
            {aiInsights.length > 0 ? (
              <div className="space-y-3">
                {aiInsights.map((insight, idx) => {
                  const Icon = insight.icon;
                  return (
                    <div
                      key={idx}
                      className={`border-2 p-3 ${insight.type === 'success' ? 'border-[#006400] bg-[#006400]/10' :
                        insight.type === 'warning' ? 'border-[#8b0000] bg-[#8b0000]/10' :
                          'border-[#1a1a1a] bg-[#f5f2e9]'
                        }`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <Icon className={`h-4 w-4 mt-0.5 ${insight.type === 'success' ? 'text-[#006400]' :
                          insight.type === 'warning' ? 'text-[#8b0000]' :
                            'text-[#1a1a1a]'
                          }`} />
                        <p className="font-serif text-xs font-bold">{insight.title}</p>
                      </div>
                      <p className="font-serif text-xs text-[#4a4a4a] ml-6">{insight.message}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center font-serif text-[#6b6b6b] text-sm py-4">
                All systems optimal ✅
              </p>
            )}
          </div>

          {/* Investment Style */}
          <div className="border border-[#1a1a1a] p-4">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
              Your Investment Style
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-serif mb-1">
                  <span className="text-[#6b6b6b]">Risk Level</span>
                  <span className="font-bold">{riskTolerance}</span>
                </div>
                <div className="w-full bg-[#ede8d8] h-2 border border-[#1a1a1a]">
                  <div
                    className={`h-full ${riskTolerance === 'Conservative' ? 'bg-[#006400] w-1/3' :
                      riskTolerance === 'Moderate' ? 'bg-[#b8860b] w-2/3' :
                        'bg-[#8b0000] w-full'
                      }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-serif mb-1">
                  <span className="text-[#6b6b6b]">Time Horizon</span>
                  <span className="font-bold">{horizon}</span>
                </div>
                <div className="w-full bg-[#ede8d8] h-2 border border-[#1a1a1a]">
                  <div
                    className={`h-full bg-[#1a1a1a] ${horizon === 'Short-term' ? 'w-1/3' :
                      horizon === 'Medium-term' ? 'w-2/3' :
                        'w-full'
                      }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-serif mb-1">
                  <span className="text-[#6b6b6b]">Capital Deployed</span>
                  <span className="font-bold">{deploymentRate.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-[#ede8d8] h-2 border border-[#1a1a1a]">
                  <div
                    className="h-full bg-[#1a1a1a]"
                    style={{ width: `${Math.min(100, deploymentRate)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Impact */}
          <div className="border border-[#1a1a1a] p-4">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
              How This Affects Analysis
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 border border-[#1a1a1a] flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-serif font-bold text-sm">Personalized</p>
                  <p className="text-xs font-serif text-[#6b6b6b]">
                    Analysis tailored to your risk tolerance
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 border border-[#1a1a1a] flex items-center justify-center">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-serif font-bold text-sm">Position Sizing</p>
                  <p className="text-xs font-serif text-[#6b6b6b]">
                    Recommendations based on your capital
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 border border-[#1a1a1a] flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-serif font-bold text-sm">Time Filtering</p>
                  <p className="text-xs font-serif text-[#6b6b6b]">
                    Stories filtered by your timeline
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
