import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Clock, Save, RefreshCw, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApiClient, ApiError } from '@/services/api';
import type { UserProfileResponse } from '@/services/api';
import { toast } from 'sonner';

type RiskTolerance = 'Conservative' | 'Moderate' | 'Aggressive';
type InvestmentHorizon = 'Short-term' | 'Medium-term' | 'Long-term';

export function Profile() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('Moderate');
  const [capital, setCapital] = useState<number>(100000);
  const [horizon, setHorizon] = useState<InvestmentHorizon>('Medium-term');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();
      const data = await api.getProfile();
      setProfile(data);
      setRiskTolerance((data.risk_tolerance as RiskTolerance) || 'Moderate');
      setCapital(data.capital || 100000);
      setHorizon((data.horizon as InvestmentHorizon) || 'Medium-term');
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
      toast.success('Profile updated');
      await fetchProfile();
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
    fetchProfile();
  }, []);

  const riskDescriptions = {
    Conservative: 'Focus on capital preservation with minimal risk.',
    Moderate: 'Balanced approach with moderate risk and return.',
    Aggressive: 'Higher risk tolerance for potentially greater returns.',
  };

  const horizonDescriptions = {
    'Short-term': 'Less than 1 year investment horizon.',
    'Medium-term': '1-3 year investment horizon.',
    'Long-term': '3+ year investment horizon.',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b-2 border-[#1a1a1a] pb-4">
        <h1 className="headline-main text-center">Investor Profile</h1>
        <p className="text-center font-serif text-[#6b6b6b] mt-2">
          Customize your investment preferences and risk parameters
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-[#8b0000]/10 border-[#8b0000] text-[#8b0000]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Profile Card */}
      {profile && (
        <div className="border-2 border-[#1a1a1a] p-6 bg-[#ede8d8]">
          <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
            Current Profile
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Risk Tolerance</p>
              <span className={`tag-newspaper ${
                profile.risk_tolerance === 'Conservative' ? 'bg-[#006400] text-[#f5f2e9]' :
                profile.risk_tolerance === 'Moderate' ? 'bg-[#b8860b] text-[#f5f2e9]' :
                'bg-[#8b0000] text-[#f5f2e9]'
              }`}>
                {profile.risk_tolerance}
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Capital Available</p>
              <p className="text-xl font-bold font-serif">${profile.capital.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Investment Horizon</p>
              <span className="tag-newspaper">{profile.horizon}</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile */}
      <div className="border-2 border-[#1a1a1a] p-6">
        <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-6">
          Edit Profile
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
                className={`p-4 border-2 text-left transition-all ${
                  riskTolerance === risk
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
            Total capital available for investment decisions.
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
                className={`p-4 border-2 text-left transition-all ${
                  horizon === h
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
            onClick={fetchProfile}
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

      {/* Profile Impact */}
      <div className="border border-[#1a1a1a] p-6">
        <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
          How Your Profile Affects Analysis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-[#1a1a1a] mb-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="font-serif font-bold mb-1">Personalized</p>
            <p className="text-sm font-serif text-[#6b6b6b]">
              Analysis tailored to your risk tolerance
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-[#1a1a1a] mb-3">
              <DollarSign className="h-6 w-6" />
            </div>
            <p className="font-serif font-bold mb-1">Position Sizing</p>
            <p className="text-sm font-serif text-[#6b6b6b]">
              Recommendations based on your capital
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-[#1a1a1a] mb-3">
              <Clock className="h-6 w-6" />
            </div>
            <p className="font-serif font-bold mb-1">Time Filtering</p>
            <p className="text-sm font-serif text-[#6b6b6b]">
              Stories filtered by your timeline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
