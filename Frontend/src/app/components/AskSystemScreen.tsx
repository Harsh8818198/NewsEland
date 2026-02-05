import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { mockExampleQuestions } from '@/app/data/mockData';

interface AskSystemScreenProps {
  onBack: () => void;
}

export function AskSystemScreen({ onBack }: AskSystemScreenProps) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setResponse(`Analysis: This question requires examining multiple interconnected factors. Based on the current signals, we would need to consider the structural dynamics of technology sector financing, the relationship between monetary policy and innovation cycles, and historical precedents from similar tightening periods.\n\nKey considerations include the differentiation between cash-generative versus growth-stage businesses, the role of private versus public capital markets, and the specific characteristics of AI infrastructure investments compared to previous technology build-outs.\n\nThe answer depends significantly on the timeline and severity of the rate environment, as well as sector-specific factors like regulatory developments and competitive positioning.`);
      setIsProcessing(false);
    }, 1500);
  };

  const handleExampleClick = (question: string) => {
    setQuery(question);
    setResponse('');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 intel-text-muted text-[14px] mb-8 hover:text-[var(--intel-text-secondary)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to briefing
      </button>

      {/* Header */}
      <div className="mb-12 space-y-4">
        <h1 className="intel-text-heading text-[28px] leading-[1.4]">
          Ask the System
        </h1>
        <p className="intel-text-body text-[15px] leading-[1.7] max-w-2xl">
          Ask follow-up questions about today's signals, explore connections between events, or request deeper analysis on specific topics.
        </p>
      </div>

      {/* Divider */}
      <div className="intel-divider mb-12" />

      {/* Query Input */}
      <div className="space-y-8">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question here..."
            className="w-full intel-card p-6 pr-14 intel-text-body text-[15px] focus:outline-none focus:ring-1 focus:ring-[var(--intel-accent)] transition-all"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!query.trim() || isProcessing}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-sm hover:bg-[var(--intel-bg-secondary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-5 h-5 text-[var(--intel-text-muted)]" />
          </button>
        </form>

        {/* Example Questions */}
        {!response && (
          <div className="space-y-4">
            <h2 className="intel-text-muted text-[13px] uppercase tracking-wide">
              Example Questions
            </h2>
            <div className="space-y-2">
              {mockExampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(question)}
                  className="block w-full text-left intel-card p-4 intel-text-body text-[14px] hover:bg-[var(--intel-bg-secondary)] transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Response */}
        {isProcessing && (
          <div className="intel-card p-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--intel-text-muted)] animate-pulse" />
              <span className="intel-text-muted text-[14px]">Processing your question...</span>
            </div>
          </div>
        )}

        {response && !isProcessing && (
          <div className="space-y-4">
            <h2 className="intel-text-muted text-[13px] uppercase tracking-wide">
              Response
            </h2>
            <div className="intel-card p-8">
              <p className="intel-text-body text-[15px] leading-[1.8] whitespace-pre-line">
                {response}
              </p>
            </div>
            <button
              onClick={() => {
                setQuery('');
                setResponse('');
              }}
              className="intel-text-body text-[14px] px-6 py-3 bg-[var(--intel-bg-secondary)] hover:bg-[var(--intel-border)] transition-colors rounded-sm"
            >
              Ask another question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
