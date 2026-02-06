import { Story } from '@/app/types/investment';
import { SentimentBadge, MaturityBadge } from './Badge';
import { X, Clock, Tag, TrendingUp, AlertCircle, Lightbulb, BarChart3, FileText, BookOpen, Quote } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import React from 'react';

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

interface StoryDetailsModalProps {
  story: Story;
  onClose: () => void;
}

export function StoryDetailsModal({ story, onClose }: StoryDetailsModalProps) {
  // Transform sentiment history for chart
  const chartData = story.sentimentHistory.map((point) => ({
    name: point.date,
    value: point.value,
  }));

  // Calculate sentiment distribution for pie chart
  const sentimentDistribution = [
    { name: 'Positive', value: story.sentimentHistory.filter(p => p.value > 0.1).length, color: '#10b981' },
    { name: 'Neutral', value: story.sentimentHistory.filter(p => p.value >= -0.1 && p.value <= 0.1).length, color: '#6b7280' },
    { name: 'Negative', value: story.sentimentHistory.filter(p => p.value < -0.1).length, color: '#ef4444' },
  ];

  // Get first letter for drop cap
  const firstLetter = story.currentHypothesis?.what?.[0] || story.summary?.[0] || '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-8">
      <div className="bg-gradient-to-br from-[#faf9f6] to-[#f5f3ef] rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-[#e5e3df]">
        {/* Elegant Header with Paper Texture */}
        <div className="bg-gradient-to-r from-[#2c3e50] to-[#34495e] px-8 py-6 border-b-2 border-[#1a252f] flex items-start justify-between">
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-white/80" />
              <span className="text-xs text-white/70 uppercase tracking-wider font-medium">Market Intelligence Report</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-white mb-4 leading-tight font-light tracking-tight">
              {story.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{new Date(story.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <span className="text-white/60">•</span>
              <MaturityBadge maturity={story.maturity} />
              <span className="text-white/60">•</span>
              <SentimentBadge sentiment={story.sentiment} />
              <span className="text-white/60">•</span>
              <span>{story.updateCount} data points</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Paper-like Reading Experience */}
        <div className="flex-1 overflow-y-auto px-8 md:px-12 py-10 space-y-10 bg-[#faf9f6]">
          {/* Executive Summary with Drop Cap */}
          {story.currentHypothesis && (
            <article className="prose prose-lg max-w-none">
              <div className="relative mb-8 pb-6 border-b-2 border-[#d4af37]/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-[#d4af37] to-[#b8941f]"></div>
                  <h2 className="text-2xl font-serif text-[#2c3e50] m-0 font-light tracking-wide">
                    Executive Summary
                  </h2>
                </div>
                
                {/* Drop Cap Design */}
                <div className="relative">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 float-left mr-4 mb-2 bg-gradient-to-br from-[#d4af37]/20 to-[#b8941f]/10 border-2 border-[#d4af37]/30 rounded-lg flex items-center justify-center">
                        <span className="text-4xl md:text-5xl font-serif text-[#2c3e50] font-bold leading-none">
                          {firstLetter}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg md:text-xl text-[#3d4f63] leading-relaxed font-serif mb-6 first-letter:text-5xl first-letter:font-bold first-letter:text-[#d4af37] first-letter:mr-2 first-letter:float-left">
                        {story.currentHypothesis.what}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Infographic */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#e5e3df]">
                  <div className="text-center">
                    <div className="text-3xl font-serif text-[#2c3e50] font-bold mb-1">
                      {story.currentHypothesis.sentiment_score > 0 ? '+' : ''}{story.currentHypothesis.sentiment_score.toFixed(2)}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-[#6b7280]">Sentiment Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-serif text-[#2c3e50] font-bold mb-1">
                      {story.updateCount}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-[#6b7280]">Data Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-serif text-[#2c3e50] font-bold mb-1">
                      {story.relatedEntities.length}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-[#6b7280]">Entities</div>
                  </div>
                </div>
              </div>

              {/* Hypothesis Analysis - Professional Layout */}
              <section className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <Quote className="w-6 h-6 text-[#d4af37]" />
                  <h2 className="text-2xl font-serif text-[#2c3e50] m-0 font-light">Analysis Framework</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h3 className="text-lg font-serif text-[#2c3e50] m-0 font-medium">What</h3>
                    </div>
                    <p className="text-base text-[#4a5568] leading-relaxed font-serif m-0">
                      {story.currentHypothesis.what}
                    </p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <h3 className="text-lg font-serif text-[#2c3e50] m-0 font-medium">Why</h3>
                    </div>
                    <p className="text-base text-[#4a5568] leading-relaxed font-serif m-0">
                      {story.currentHypothesis.why}
                    </p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h3 className="text-lg font-serif text-[#2c3e50] m-0 font-medium">How</h3>
                    </div>
                    <p className="text-base text-[#4a5568] leading-relaxed font-serif m-0">
                      {story.currentHypothesis.how}
                    </p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <h3 className="text-lg font-serif text-[#2c3e50] m-0 font-medium">Expected Impact</h3>
                    </div>
                    <p className="text-base text-[#4a5568] leading-relaxed font-serif m-0">
                      {story.currentHypothesis.expected_impact}
                    </p>
                  </div>
                </div>

                {/* Event Type Badge */}
                {story.currentHypothesis.key_event_type && story.currentHypothesis.key_event_type !== 'None' && (
                  <div className="mt-6 flex items-center justify-center">
                    <div className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-white rounded-full shadow-lg">
                      <span className="text-sm font-medium uppercase tracking-wider">
                        {story.currentHypothesis.key_event_type}
                      </span>
                    </div>
                  </div>
                )}
              </section>
            </article>
          )}

          {/* Hypothesis Evolution - Professional Comparison */}
          {story.previousHypothesis && story.currentHypothesis && (
            <section className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-[#e5e3df]">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-[#d4af37]" />
                <h2 className="text-2xl font-serif text-[#2c3e50] m-0 font-light">Hypothesis Evolution</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/90 backdrop-blur-sm border-2 border-[#d1d5db] rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e5e3df]">
                    <h4 className="text-lg font-serif text-[#6b7280] m-0 font-medium">Previous Assessment</h4>
                    <span className="px-3 py-1 bg-[#6b7280]/10 text-[#6b7280] rounded-full text-xs font-medium">
                      {story.previousHypothesis.sentiment_label} ({story.previousHypothesis.sentiment_score > 0 ? '+' : ''}{story.previousHypothesis.sentiment_score.toFixed(2)})
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-[#9ca3af] mb-2 font-medium">
                    {story.previousHypothesis.key_event_type}
                  </p>
                  <p className="text-base text-[#4a5568] leading-relaxed font-serif m-0">
                    {story.previousHypothesis.what}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-white to-[#fef3c7]/30 border-2 border-[#d4af37] rounded-lg p-6 shadow-md relative">
                  <div className="absolute top-3 right-3 px-2 py-1 bg-[#d4af37] text-white rounded-full text-xs font-bold uppercase tracking-wider">
                    Current
                  </div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#d4af37]/30">
                    <h4 className="text-lg font-serif text-[#2c3e50] m-0 font-medium">Current Assessment</h4>
                    <span className="px-3 py-1 bg-[#d4af37]/20 text-[#b8941f] rounded-full text-xs font-medium border border-[#d4af37]/30">
                      {story.currentHypothesis.sentiment_label} ({story.currentHypothesis.sentiment_score > 0 ? '+' : ''}{story.currentHypothesis.sentiment_score.toFixed(2)})
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-[#b8941f] mb-2 font-medium">
                    {story.currentHypothesis.key_event_type}
                  </p>
                  <p className="text-base text-[#3d4f63] leading-relaxed font-serif m-0 font-medium">
                    {story.currentHypothesis.what}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Strategic Intelligence Report - Paper-like */}
          {story.subreport && (
            <section className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border-2 border-[#d4af37]/20">
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#d4af37]/30">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-[#d4af37]" />
                  <h2 className="text-2xl font-serif text-[#2c3e50] m-0 font-light">Strategic Intelligence Report</h2>
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                  AI-Generated Analysis
                </span>
              </div>
              <div className="prose prose-lg max-w-none">
                <div className="text-base md:text-lg text-[#3d4f63] leading-relaxed font-serif">
                  {formatMarkdown(story.subreport)}
                </div>
              </div>
            </section>
          )}

          {/* Key Insights - Professional Format */}
          <section className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-[#e5e3df]">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-6 h-6 text-[#d4af37]" />
              <h2 className="text-2xl font-serif text-[#2c3e50] m-0 font-light">Key Insights</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4 pb-6 border-b border-[#e5e3df] last:border-0 last:pb-0">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-serif text-[#2c3e50] mb-2 font-medium">Market Pattern Recognition</h3>
                  <p className="text-base text-[#4a5568] leading-relaxed font-serif m-0">
                    This story has been classified under the <strong className="text-[#2c3e50]">"{story.topic}"</strong> pattern with <strong className="text-[#2c3e50]">{story.updateCount}</strong> data points collected. 
                    The system has identified <strong className="text-[#2c3e50]">{story.relatedEntities.length}</strong> key entities involved in this development.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-6 border-b border-[#e5e3df] last:border-0 last:pb-0">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-serif text-[#2c3e50] mb-2 font-medium">Sentiment Trajectory</h3>
                  <p className="text-base text-[#4a5568] leading-relaxed font-serif m-0">
                    Current sentiment is <strong className="text-[#2c3e50]">{story.sentiment}</strong>. The story has evolved through <strong className="text-[#2c3e50]">{story.sentimentHistory.length}</strong> sentiment 
                    shifts, indicating {story.sentimentHistory.length > 3 ? 'significant market attention' : 'emerging market interest'}.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-6 border-b border-[#e5e3df] last:border-0 last:pb-0">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-serif text-[#2c3e50] mb-2 font-medium">Story Maturity Assessment</h3>
                  <p className="text-base text-[#4a5568] leading-relaxed font-serif m-0">
                    {story.maturity === 'Mature' 
                      ? 'This is a mature story with established patterns and sufficient data for high-confidence analysis. Investment decisions can be made with greater certainty.'
                      : 'This is a developing story with limited historical data. Exercise caution and wait for additional confirmation before making significant investment decisions.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Investment Implications - Professional Cards */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-[#d4af37]" />
              <h2 className="text-2xl font-serif text-[#2c3e50] m-0 font-light">Investment Implications</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl p-6 shadow-md border-2 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-serif text-[#065f46] m-0 font-semibold uppercase tracking-wider">Opportunities</h3>
                </div>
                <p className="text-base text-[#047857] leading-relaxed font-serif m-0">
                  {story.sentiment === 'positive' 
                    ? `Positive sentiment with ${story.updateCount} updates suggests growing momentum. Consider positions in related entities for medium-term gains.`
                    : story.sentiment === 'negative'
                    ? 'Negative sentiment may present contrarian opportunities for risk-tolerant investors once the story stabilizes.'
                    : 'Neutral sentiment indicates a wait-and-see approach. Monitor for directional clarity before committing capital.'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-rose-50/50 rounded-xl p-6 shadow-md border-2 border-red-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h3 className="text-lg font-serif text-[#991b1b] m-0 font-semibold uppercase tracking-wider">Risks</h3>
                </div>
                <p className="text-base text-[#b91c1c] leading-relaxed font-serif m-0">
                  {story.maturity === 'Developing'
                    ? 'Limited data points increase uncertainty. Volatility expected as the story develops. Size positions accordingly.'
                    : 'Mature story with established patterns. Risk of mean reversion if sentiment becomes too extreme.'}
                </p>
              </div>
            </div>
          </section>

          {/* Risk Assessment - Professional Metrics */}
          <section className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-[#e5e3df]">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-[#d4af37]" />
              <h2 className="text-2xl font-serif text-[#2c3e50] m-0 font-light">Risk Assessment</h2>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-serif text-[#3d4f63] font-medium">Data Confidence</span>
                  <span className="text-lg font-serif text-[#2c3e50] font-bold">
                    {story.maturity === 'Mature' ? 'High' : 'Medium'}
                  </span>
                </div>
                <div className="w-full bg-[#e5e3df] rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] h-full rounded-full transition-all shadow-sm"
                    style={{ width: story.maturity === 'Mature' ? '85%' : '45%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-serif text-[#3d4f63] font-medium">Volatility Risk</span>
                  <span className="text-lg font-serif text-[#2c3e50] font-bold">
                    {story.sentiment === 'neutral' ? 'Low' : 'Medium'}
                  </span>
                </div>
                <div className="w-full bg-[#e5e3df] rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all shadow-sm"
                    style={{ width: story.sentiment === 'neutral' ? '30%' : '60%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-serif text-[#3d4f63] font-medium">Information Quality</span>
                  <span className="text-lg font-serif text-[#2c3e50] font-bold">
                    {story.updateCount > 10 ? 'High' : 'Medium'}
                  </span>
                </div>
                <div className="w-full bg-[#e5e3df] rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all shadow-sm"
                    style={{ width: story.updateCount > 10 ? '80%' : '50%' }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Story Maturity - Elegant Progress */}
          <section className="bg-gradient-to-br from-white/80 to-[#fef3c7]/20 rounded-xl p-6 shadow-md border-2 border-[#d4af37]/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-[#d4af37]" />
                <h3 className="text-lg font-serif text-[#2c3e50] m-0 font-medium">Story Maturity</h3>
              </div>
              <span className="text-sm font-serif text-[#6b7280]">
                {story.updateCount} data points
              </span>
            </div>
            <div className="w-full bg-[#e5e3df] rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] h-full rounded-full transition-all shadow-md flex items-center justify-end pr-2"
                style={{ width: story.maturity === 'Mature' ? '100%' : '45%' }}
              >
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {story.maturity}
                </span>
              </div>
            </div>
          </section>

          {/* Professional Infographics Section */}
          <section className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-[#e5e3df]">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-[#d4af37]" />
              <h2 className="text-2xl font-serif text-[#2c3e50] m-0 font-light">Data Visualization</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sentiment Over Time - Elegant Chart */}
              <div>
                <h3 className="text-lg font-serif text-[#2c3e50] mb-4 font-medium">Sentiment Trajectory</h3>
                <div className="bg-white rounded-lg p-4 border border-[#e5e3df]">
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e3df" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'serif' }}
                        axisLine={{ stroke: '#d1d5db' }}
                      />
                      <YAxis
                        domain={[-1, 1]}
                        tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'serif' }}
                        axisLine={{ stroke: '#d1d5db' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#faf9f6',
                          border: '1px solid #e5e3df',
                          borderRadius: '8px',
                          fontFamily: 'serif',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#d4af37"
                        strokeWidth={2}
                        fill="url(#sentimentGradient)"
                        dot={{ fill: '#d4af37', r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sentiment Distribution - Pie Chart */}
              <div>
                <h3 className="text-lg font-serif text-[#2c3e50] mb-4 font-medium">Sentiment Distribution</h3>
                <div className="bg-white rounded-lg p-4 border border-[#e5e3df]">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={sentimentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sentimentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#faf9f6',
                          border: '1px solid #e5e3df',
                          borderRadius: '8px',
                          fontFamily: 'serif',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          {/* Patterns Overview - Elegant Display */}
          {story.events && story.events.length > 0 && (
            <section className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[#e5e3df]">
              <h3 className="text-lg font-serif text-[#2c3e50] mb-4 font-medium">Market Patterns Detected</h3>
              <div className="flex flex-wrap gap-3">
                {Array.from(new Set(story.events.map(e => e.pattern).filter(p => p && p !== 'None'))).map((pattern, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-[#d4af37]/10 to-[#b8941f]/10 border border-[#d4af37]/30 rounded-full text-sm text-[#3d4f63] font-serif shadow-sm hover:shadow-md transition-shadow"
                  >
                    {pattern}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Timeline of Updates - Novel-like Timeline */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-[#d4af37]" />
              <h2 className="text-2xl font-serif text-[#2c3e50] m-0 font-light">Chronological Narrative</h2>
            </div>
            <div className="relative pl-8 border-l-2 border-[#d4af37]/30">
              {story.updates.map((update) => (
                <div
                  key={update.id}
                  className="relative mb-8 last:mb-0"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[21px] top-1 w-4 h-4 bg-white border-2 border-[#d4af37] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full" />
                  </div>
                  
                  {/* Content Card */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-[#e5e3df]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs uppercase tracking-wider text-[#6b7280] font-medium">
                          {update.timestamp}
                        </span>
                        <SentimentBadge sentiment={update.sentiment} size="sm" />
                        {update.keyEventType && update.keyEventType !== 'None' && (
                          <span className="px-2.5 py-1 bg-[#d4af37]/10 text-[#b8941f] rounded-full text-xs font-medium border border-[#d4af37]/20">
                            {update.keyEventType}
                          </span>
                        )}
                        {update.pattern && update.pattern !== 'None' && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                            {update.pattern}
                          </span>
                        )}
                      </div>
                      {update.sentimentScore !== undefined && (
                        <div className="text-sm font-serif text-[#2c3e50] font-semibold">
                          {update.sentimentScore > 0 ? '+' : ''}{update.sentimentScore.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <p className="text-base text-[#3d4f63] leading-relaxed font-serif m-0">
                      {update.headline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Related Entities - Elegant Tags */}
          <section className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[#e5e3df]">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-5 h-5 text-[#d4af37]" />
              <h3 className="text-lg font-serif text-[#2c3e50] m-0 font-medium">Key Entities</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {story.relatedEntities.map((entity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white to-[#faf9f6] border border-[#e5e3df] rounded-full text-sm text-[#3d4f63] font-serif shadow-sm hover:shadow-md transition-shadow"
                >
                  <Tag className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{entity}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
