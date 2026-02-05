import { useState } from 'react';
import { Sparkles, Tag, TrendingUp, AlertCircle, Lightbulb, Clock, FileText } from 'lucide-react';
import { SentimentBadge } from '../Badge';
import { AnalysisResult } from '../../../types/investment'
import { useApiContext } from '../../../services/apiContext'
import { ErrorMessage } from '../../ErrorBoundary'

// Simple markdown-like text formatter
function formatMarkdown(text: string) {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  
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
