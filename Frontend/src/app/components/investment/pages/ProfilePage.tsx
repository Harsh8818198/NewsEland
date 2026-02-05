import { useState, useEffect } from 'react';
import { RiskTolerance, InvestmentHorizon } from '../../../types/investment'
import { User, DollarSign, Calendar, Shield, Save } from 'lucide-react'
import { useApiContext } from '../../../services/apiContext'
import { ErrorMessage, LoadingSkeleton } from '../../ErrorBoundary'

export function ProfilePage() {
  const apiContext = useApiContext();
  const { userProfile } = apiContext;
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('Conservative');
  const [capitalAvailable, setCapitalAvailable] = useState(50000);
  const [investmentHorizon, setInvestmentHorizon] = useState<InvestmentHorizon>('Medium');

  // Update state when profile data is loaded
  useEffect(() => {
    if (userProfile.data) {
      setRiskTolerance(userProfile.data.riskTolerance);
      setCapitalAvailable(userProfile.data.capitalAvailable);
      setInvestmentHorizon(userProfile.data.investmentHorizon);
    }
  }, [userProfile.data]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await apiContext.actions.updateUserProfile({
        user_id: 'current_user',
        risk_tolerance: riskTolerance,
        capital_available: capitalAvailable,
        investment_horizon: investmentHorizon,
      });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const riskProfiles: Record<RiskTolerance, { description: string; characteristics: string[] }> = {
    Conservative: {
      description:
        'Prioritizes capital preservation and stable returns. Recommends established companies with strong balance sheets and defensive characteristics. Suitable for those with lower risk tolerance or shorter time horizons.',
      characteristics: ['Lower volatility', 'Defensive sectors', 'Dividend focus', 'Quality bias'],
    },
    Aggressive: {
      description:
        'Seeks maximum growth potential and accepts higher volatility. Recommends high-growth companies, emerging sectors, and market opportunities with asymmetric upside. Suitable for those comfortable with fluctuations.',
      characteristics: [
        'Growth orientation',
        'Higher volatility acceptance',
        'Emerging sectors',
        'Innovation focus',
      ],
    },
    Contrarian: {
      description:
        'Identifies opportunities in undervalued or out-of-favor areas. Looks for market inefficiencies and sentiment extremes. Requires patience and conviction to invest against prevailing consensus.',
      characteristics: [
        'Value orientation',
        'Counter-consensus',
        'Long-term patience',
        'Distressed opportunities',
      ],
    },
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-semibold text-[var(--fintech-text-primary)] mb-2">
          User Profile
        </h1>
        <p className="text-[15px] text-[var(--fintech-text-secondary)]">
          Configure your investment preferences to receive personalized analysis and recommendations
        </p>
      </div>

      {/* Error Display */}
      {saveError && (
        <ErrorMessage message={saveError} onRetry={handleSave} />
      )}
      {userProfile.error && (
        <ErrorMessage
          message={userProfile.error.userMessage}
          onRetry={() => apiContext.actions.fetchUserProfile()}
        />
      )}

      {/* Profile Summary Card */}
      {userProfile.loading ? (
        <LoadingSkeleton count={1} height="h-96" />
      ) : (
        <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-[var(--fintech-accent)]" />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[var(--fintech-text-primary)]">
                Investment Profile
              </h2>
              <p className="text-[14px] text-[var(--fintech-text-secondary)]">
                Active • Last updated 2 days ago
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Risk Tolerance */}
            <div>
              <label className="flex items-center gap-2 text-[15px] font-medium text-[var(--fintech-text-primary)] mb-3">
                <Shield className="w-4 h-4" />
                Risk Tolerance
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Conservative', 'Aggressive', 'Contrarian'] as RiskTolerance[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => setRiskTolerance(option)}
                    className={`px-4 py-3 rounded-lg border-2 text-[14px] font-medium transition-all ${riskTolerance === option
                      ? 'border-[var(--fintech-accent)] bg-[#EEF2FF] text-[var(--fintech-accent)]'
                      : 'border-[var(--fintech-border)] bg-white text-[var(--fintech-text-secondary)] hover:border-[var(--fintech-accent)] hover:bg-[var(--fintech-bg)]'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Capital Available */}
            <div>
              <label className="flex items-center gap-2 text-[15px] font-medium text-[var(--fintech-text-primary)] mb-3">
                <DollarSign className="w-4 h-4" />
                Capital Available
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fintech-text-muted)]">
                  $
                </span>
                <input
                  type="number"
                  value={capitalAvailable}
                  onChange={(e) => setCapitalAvailable(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 bg-white border border-[var(--fintech-border)] rounded-lg text-[15px] text-[var(--fintech-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fintech-accent)] focus:border-transparent"
                />
              </div>
            </div>

            {/* Investment Horizon */}
            <div>
              <label className="flex items-center gap-2 text-[15px] font-medium text-[var(--fintech-text-primary)] mb-3">
                <Calendar className="w-4 h-4" />
                Investment Horizon
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Short', 'Medium', 'Long'] as InvestmentHorizon[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => setInvestmentHorizon(option)}
                    className={`px-4 py-3 rounded-lg border-2 text-[14px] font-medium transition-all ${investmentHorizon === option
                      ? 'border-[var(--fintech-accent)] bg-[#EEF2FF] text-[var(--fintech-accent)]'
                      : 'border-[var(--fintech-border)] bg-white text-[var(--fintech-text-secondary)] hover:border-[var(--fintech-accent)] hover:bg-[var(--fintech-bg)]'
                      }`}
                  >
                    {option === 'Short' && '<1 year'}
                    {option === 'Medium' && '1-3 years'}
                    {option === 'Long' && '3+ years'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 pt-6 border-t border-[var(--fintech-border)] flex items-center justify-between">
            {showSaved && (
              <div className="text-[14px] text-[var(--fintech-success)] font-medium">
                ✓ Profile saved successfully
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="ml-auto flex items-center gap-2 px-6 py-3 bg-[var(--fintech-accent)] hover:bg-[var(--fintech-accent-hover)] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Risk Profile Explanation */}
      <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
        <h2 className="text-[18px] font-semibold text-[var(--fintech-text-primary)] mb-4">
          {riskTolerance} Strategy
        </h2>

        <div className="space-y-4">
          <p className="text-[15px] text-[var(--fintech-text-secondary)] leading-relaxed">
            {riskProfiles[riskTolerance].description}
          </p>

          <div>
            <h3 className="text-[15px] font-medium text-[var(--fintech-text-primary)] mb-3">
              Key Characteristics:
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {riskProfiles[riskTolerance].characteristics.map((char: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--fintech-bg)] rounded-md"
                >
                  <div className="w-1.5 h-1.5 bg-[var(--fintech-accent)] rounded-full" />
                  <span className="text-[14px] text-[var(--fintech-text-secondary)]">{char}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#EEF2FF] border border-[#BFDBFE] rounded-lg p-4">
            <p className="text-[13px] text-[var(--fintech-text-primary)]">
              <strong>Note:</strong> All investment recommendations are tailored to your{' '}
              {riskTolerance.toLowerCase()} profile and {investmentHorizon.toLowerCase()}-term horizon.
              Your available capital of ${capitalAvailable.toLocaleString()} is considered when
              evaluating position sizing and diversification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
