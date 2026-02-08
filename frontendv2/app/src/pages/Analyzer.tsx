import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { getApiClient, ApiError } from '@/services/api';
import type { AnalysisResponse } from '@/services/api';
import { toast } from 'sonner';

export function Analyzer() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter a headline or text to analyze');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();
      const result = await api.analyzeText({ text: text.trim() });
      setAnalysis(result);
      toast.success('Analysis completed');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
        toast.error(err.userMessage);
      } else {
        setError('Failed to analyze text');
        toast.error('Failed to analyze text');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setAnalysis(null);
    setError(null);
  };

  const sentimentConfig = {
    Bullish: { icon: TrendingUp, color: 'text-[#006400]', bg: 'bg-[#006400]', label: 'Bullish' },
    Bearish: { icon: TrendingDown, color: 'text-[#8b0000]', bg: 'bg-[#8b0000]', label: 'Bearish' },
    Neutral: { icon: Minus, color: 'text-[#4a4a4a]', bg: 'bg-[#4a4a4a]', label: 'Neutral' },
  };

  const sentiment = analysis ? sentimentConfig[analysis.sentiment?.label as keyof typeof sentimentConfig] || sentimentConfig.Neutral : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b-2 border-[#1a1a1a] pb-4 text-center">
        <h1 className="headline-main">The Intelligence Desk</h1>
        <p className="font-serif text-[#6b6b6b] mt-2">
          Submit headlines and news for AI-powered market analysis
        </p>
      </div>

      {/* Input Section */}
      <div className="border-2 border-[#1a1a1a] p-6 bg-[#ede8d8]">
        <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
          Submit for Analysis
        </h4>

        <Textarea
          placeholder="Enter a news headline, article excerpt, or market rumor for analysis..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px] newspaper-input mb-4"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs font-serif text-[#6b6b6b]">
            {text.length} characters
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={loading || (!text && !analysis)}
              className="btn-newspaper"
            >
              Clear
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="btn-newspaper bg-[#1a1a1a] text-[#f5f2e9]"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-[#8b0000]/10 border-[#8b0000] text-[#8b0000]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Headline */}
          <div className="border border-[#1a1a1a] p-6">
            <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Analyzed Text</p>
            <p className="headline-secondary">{analysis.headline}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sentiment && (
              <div className="border-2 border-[#1a1a1a] p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Sentiment</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 ${sentiment.bg} text-[#f5f2e9]`}>
                  <sentiment.icon className="h-5 w-5" />
                  <span className="font-serif font-bold">{sentiment.label}</span>
                </div>
                <p className="text-sm font-serif text-[#6b6b6b] mt-2">
                  Score: {(analysis.sentiment.score * 100).toFixed(1)}%
                </p>
              </div>
            )}

            <div className="border-2 border-[#1a1a1a] p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Story Maturity</p>
              <p className="text-xl font-serif font-bold text-[#1a1a1a]">
                {analysis.story_context?.maturity || 'New'}
              </p>
              <p className="text-sm font-serif text-[#6b6b6b] mt-2">
                {analysis.story_context?.updates || 0} updates
              </p>
            </div>

            <div className="border-2 border-[#1a1a1a] p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Story ID</p>
              <p className="text-sm font-mono text-[#1a1a1a] truncate">
                {analysis.story_id}
              </p>
              <p className="text-sm font-serif text-[#6b6b6b] mt-2 truncate">
                {analysis.story_context?.topic || 'New Story'}
              </p>
            </div>
          </div>

          {/* Strategic Advice */}
          <div className="border-2 border-[#1a1a1a] p-6 bg-[#ede8d8]">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
              Strategic Recommendation
            </h4>
            <p className="article-text text-lg">{analysis.advice}</p>
          </div>

          {/* Full Report */}
          {analysis.subreport && (
            <div className="border border-[#1a1a1a] p-6">
              <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
                Full Analysis Report
              </h4>
              <div className="article-text whitespace-pre-wrap">
                {analysis.subreport}
              </div>
            </div>
          )}

          {/* Cognitive Analysis */}
          {analysis.cognitive_analysis && (
            <div className="border border-[#1a1a1a] p-6">
              <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
                Cognitive Analysis
              </h4>
              <div className="space-y-4">
                {analysis.cognitive_analysis.conviction !== undefined && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Conviction Level</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-4 border border-[#1a1a1a]">
                        <div
                          className="h-full bg-[#1a1a1a]"
                          style={{ width: `${analysis.cognitive_analysis.conviction * 100}%` }}
                        />
                      </div>
                      <span className="font-serif font-bold">
                        {(analysis.cognitive_analysis.conviction * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}

                {analysis.cognitive_analysis.contrarian_angle && (
                  <div className="border-t border-[#ede8d8] pt-4">
                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Contrarian View</p>
                    <p className="article-text">{analysis.cognitive_analysis.contrarian_angle}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
