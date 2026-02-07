import { useState } from 'react';
import { Sparkles, Tag, TrendingUp, AlertCircle, Clock, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { SentimentBadge } from '../Badge';
import { AnalysisResult } from '../../../types/investment'
import { useApiContext } from '../../../services/apiContext'
import { ErrorMessage } from '../../ErrorBoundary'

// Simple markdown-like text formatter
function formatMarkdown(text: string) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.JSX.Element[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('###')) {
      elements.push(
        <h4 key={index} className="text-[15px] font-semibold text-[var(--fintech-text-primary)] mt-4 mb-2">
          {trimmed.replace(/^###\s*/, '')}
        </h4>
      );
    } else if (trimmed.startsWith('##')) {
      elements.push(
        <h3 key={index} className="text-[16px] font-semibold text-[var(--fintech-text-primary)] mt-5 mb-2">
          {trimmed.replace(/^##\s*/, '')}
        </h3>
      );
    } else if (trimmed.startsWith('#')) {
      elements.push(
        <h2 key={index} className="text-[18px] font-semibold text-[var(--fintech-text-primary)] mt-6 mb-3">
          {trimmed.replace(/^#\s*/, '')}
        </h2>
      );
    }
    // Bold text
    else if (trimmed.includes('**')) {
      const parts = trimmed.split('**');
      elements.push(
        <p key={index} className="text-[14px] text-[var(--fintech-text-secondary)] leading-relaxed mb-2">
          {parts.map((part, i) =>
            i % 2 === 1 ? <strong key={i} className="font-semibold text-[var(--fintech-text-primary)]">{part}</strong> : part
          )}
        </p>
      );
    }
    // Bullet points
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <li key={index} className="text-[14px] text-[var(--fintech-text-secondary)] ml-4 mb-1">
          {trimmed.replace(/^[-*]\s*/, '')}
        </li>
      );
    }
    // Empty lines
    else if (trimmed === '') {
      elements.push(<div key={index} className="h-2" />);
    }
    // Regular text
    else if (trimmed.length > 0) {
      elements.push(
        <p key={index} className="text-[14px] text-[var(--fintech-text-secondary)] leading-relaxed mb-2">
          {trimmed}
        </p>
      );
    }
  });

  return <div>{elements}</div>;
}

export function AnalyzerPage() {
  const apiContext = useApiContext();
  const { analysis } = apiContext;
  const [inputText, setInputText] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    try {
      await apiContext.actions.analyzeHeadline(inputText);
      setInputText('');
      // Get the latest analysis result
      if (analysis.results.length > 0) {
        setCurrentAnalysis(analysis.results[0]);
      }
    } catch (error) {
      // Error is handled by context and displayed below
      console.error('Analysis failed:', error);
    }
  };

  const displayAnalysis = currentAnalysis || (analysis.results.length > 0 ? analysis.results[0] : null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-semibold text-[var(--fintech-text-primary)] mb-2">
          Interactive Analyzer
        </h1>
        <p className="text-[15px] text-[var(--fintech-text-secondary)]">
          Analyze headlines and news text to extract insights and receive personalized investment advice
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
        <label className="block text-[15px] font-medium text-[var(--fintech-text-primary)] mb-3">
          Enter headline or news text
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste a financial headline, news snippet, or market update here..."
          className="w-full h-32 px-4 py-3 bg-[var(--fintech-bg)] border border-[var(--fintech-border)] rounded-lg text-[15px] text-[var(--fintech-text-primary)] placeholder:text-[var(--fintech-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--fintech-accent)] focus:border-transparent resize-none"
        />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[13px] text-[var(--fintech-text-muted)]">
            {inputText.length} characters
          </span>
          <button
            onClick={handleAnalyze}
            disabled={!inputText.trim() || analysis.loading}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--fintech-accent)] hover:bg-[var(--fintech-accent-hover)] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {analysis.loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {analysis.error && (
        <ErrorMessage
          message={analysis.error.userMessage}
          onRetry={() => handleAnalyze()}
        />
      )}

      {/* Results Section */}
      {displayAnalysis && (
        <div className="space-y-4">
          <h2 className="text-[20px] font-semibold text-[var(--fintech-text-primary)]">
            Analysis Results
          </h2>

          {/* Results Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Extracted Entities */}
            <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-[var(--fintech-accent)]" />
                <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)]">
                  Extracted Entities
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {displayAnalysis.entities.map((entity: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-[#EEF2FF] text-[var(--fintech-accent)] rounded-md text-[14px] font-medium"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </div>

            {/* Sentiment Result */}
            <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[var(--fintech-accent)]" />
                <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)]">
                  Sentiment Analysis
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[14px] text-[var(--fintech-text-secondary)]">Classification:</span>
                  <SentimentBadge sentiment={displayAnalysis.sentiment} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[14px] text-[var(--fintech-text-secondary)]">Score:</span>
                  <span className="text-[16px] font-semibold text-[var(--fintech-text-primary)]">
                    {displayAnalysis.sentimentScore.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Profit Logic Section (NEW) */}
            {displayAnalysis.cognitive_analysis && (
              <div className="col-span-2 bg-[#faf9f6] border border-[#e5e3df] rounded-lg overflow-hidden">
                <div className="bg-[#1a1a1a] px-6 py-4 flex justify-between items-center">
                  <h3 className="text-white font-bold tracking-wider uppercase text-sm flex items-center gap-2">
                    <span className="text-[#d4af37]">✦</span> Profit Logic
                  </h3>
                  <span className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded border border-white/20">
                    Conviction: {displayAnalysis.cognitive_analysis.conviction}/10
                  </span>
                </div>

                <div className="p-6">
                  {/* So What? */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-[#999] mb-2">The Bottom Line</h4>
                    <p className="text-[16px] font-serif leading-relaxed text-[#1a1a1a]">
                      {displayAnalysis.cognitive_analysis.so_what}
                    </p>
                  </div>

                  {/* Winners & Losers Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Winners */}
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-700 mb-3 border-b border-emerald-100 pb-2">
                        <ChevronUp className="w-4 h-4" /> Winners
                      </h4>
                      <div className="space-y-3">
                        {displayAnalysis.cognitive_analysis.winners.map((winner: any, idx: number) => (
                          <div key={idx} className="bg-white p-3 rounded border border-[#e5e3df] shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-[#1a1a1a] text-sm">{winner.entity}</span>
                              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {winner.expected_impact}
                              </span>
                            </div>
                            <p className="text-xs text-[#666] leading-snug">{winner.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Losers */}
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-rose-700 mb-3 border-b border-rose-100 pb-2">
                        <ChevronDown className="w-4 h-4" /> Losers
                      </h4>
                      <div className="space-y-3">
                        {displayAnalysis.cognitive_analysis.losers.map((loser: any, idx: number) => (
                          <div key={idx} className="bg-white p-3 rounded border border-[#e5e3df] shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-[#1a1a1a] text-sm">{loser.entity}</span>
                              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                {loser.expected_impact}
                              </span>
                            </div>
                            <p className="text-xs text-[#666] leading-snug">{loser.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Real World Opportunities */}
                  {displayAnalysis.cognitive_analysis.real_world_opportunities?.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-[#e5e3df]">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-4 flex items-center gap-2">
                        🌍 Real-World Actions
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {displayAnalysis.cognitive_analysis.real_world_opportunities.map((opp: any, idx: number) => (
                          <div key={idx} className="flex gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-[10px]">
                                {idx + 1}
                              </div>
                            </div>
                            <div>
                              <div className="flex flex-wrap gap-2 items-center mb-1">
                                <span className="font-bold text-[#1a1a1a] text-sm">{opp.action}</span>
                                <span className="text-[10px] font-bold uppercase bg-white border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                                  {opp.type.replace('_', ' ')}
                                </span>
                                {opp.timing.includes('URGENT') && (
                                  <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded animate-pulse">
                                    Urgent
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#555] mb-1">{opp.reasoning}</p>
                              <div className="flex gap-3 text-[11px] text-[#777] font-sans">
                                <span>Inv: <strong>{opp.investment}</strong></span>
                                <span>Gain: <strong>{opp.expected_savings}</strong></span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contrarian Angle */}
                  {displayAnalysis.cognitive_analysis.contrarian_angle && (
                    <div className="mt-6 pt-6 border-t border-[#e5e3df]">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-2">
                        The Contrarian View
                      </h4>
                      <p className="text-sm font-serif italic text-[#555] bg-white p-3 border border-[#e5e3df] rounded">
                        "{displayAnalysis.cognitive_analysis.contrarian_angle}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Story Context */}
            <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[var(--fintech-accent)]" />
                <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)]">
                  Story Context
                </h3>
              </div>
              {displayAnalysis.storyContext ? (
                <div className="bg-[#EEF2FF] border border-[#BFDBFE] rounded-lg p-4">
                  <p className="text-[14px] text-[var(--fintech-text-primary)]">
                    This relates to tracked story:{' '}
                    <span className="font-medium">{displayAnalysis.storyContext}</span>
                  </p>
                </div>
              ) : (
                <p className="text-[14px] text-[var(--fintech-text-secondary)]">
                  No existing story context found. This may be a new development.
                </p>
              )}
            </div>

            {/* Personalized Advice */}
            <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[var(--fintech-accent)]" />
                <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)]">
                  Gemini Strategic Intelligence Report
                </h3>
                <span className="ml-auto px-2 py-1 bg-[#EEF2FF] text-[var(--fintech-accent)] rounded text-[12px] font-medium">
                  AI-Generated
                </span>
              </div>
              <div className="bg-gradient-to-br from-[#F0FDF4] to-[#EEF2FF] border border-[#BBF7D0] rounded-lg p-5">
                {formatMarkdown(displayAnalysis.personalizedAdvice)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis History */}
      <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
        <h2 className="text-[18px] font-semibold text-[var(--fintech-text-primary)] mb-4">
          Analysis History
        </h2>

        <div className="space-y-4">
          {analysis.results.map((analysisResult: AnalysisResult) => (
            <div
              key={analysisResult.id}
              className="p-4 bg-[var(--fintech-bg)] border border-[var(--fintech-border)] rounded-lg hover:border-[var(--fintech-accent)] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-[14px] text-[var(--fintech-text-primary)] flex-1">
                  {analysisResult.inputText}
                </p>
                <div className="flex items-center gap-2">
                  <SentimentBadge sentiment={analysisResult.sentiment} size="sm" />
                  <span className="text-[13px] text-[var(--fintech-text-muted)] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {analysisResult.timestamp}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.entities.map((entity: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-white border border-[var(--fintech-border)] rounded text-[12px] text-[var(--fintech-text-secondary)]"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
