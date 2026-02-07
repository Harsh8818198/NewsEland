import { Story } from '@/app/types/investment';
import { X, Clock, Calendar, Share2, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import React, { useState } from 'react';

// Simple markdown-like text formatter
function formatMarkdown(text: string) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.JSX.Element[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('###')) {
      elements.push(<h4 key={index} className="text-lg font-bold text-[#1a1a1a] mt-6 mb-3 font-libre">{trimmed.replace(/^###\s*/, '')}</h4>);
    } else if (trimmed.startsWith('##')) {
      elements.push(<h3 key={index} className="text-xl font-bold text-[#1a1a1a] mt-8 mb-4 font-libre">{trimmed.replace(/^##\s*/, '')}</h3>);
    } else if (trimmed.startsWith('#')) {
      elements.push(<h2 key={index} className="text-2xl font-bold text-[#1a1a1a] mt-8 mb-4 font-libre">{trimmed.replace(/^#\s*/, '')}</h2>);
    } else if (trimmed.includes('**')) {
      const parts = trimmed.split('**');
      elements.push(
        <p key={index} className="text-[17px] text-[#333] leading-relaxed mb-4 font-serif">
          {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-[#1a1a1a]">{part}</strong> : part)}
        </p>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(<li key={index} className="text-[17px] text-[#333] ml-6 mb-2 font-serif list-disc">{trimmed.replace(/^[-*]\s*/, '')}</li>);
    } else if (trimmed === '') {
      elements.push(<div key={index} className="h-4" />);
    } else if (trimmed.length > 0) {
      elements.push(<p key={index} className="text-[17px] text-[#333] leading-relaxed mb-4 font-serif">{trimmed}</p>);
    }
  });
  return <div>{elements}</div>;
}

interface StoryDetailsModalProps {
  story: Story;
  onClose: () => void;
}

export function StoryDetailsModal({ story, onClose }: StoryDetailsModalProps) {
  // Compute Sentiment Distribution
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };

  // Count from events if available, otherwise from updates or history
  const sourceData = story.events?.length ? story.events : story.updates || [];

  if (sourceData.length > 0) {
    sourceData.forEach(item => {
      // Check various sentiment structures
      const label = (item as any).sentiment?.sentiment_label || (item as any).sentiment || '';
      const lowerLabel = label.toString().toLowerCase();

      if (lowerLabel.includes('bullish') || lowerLabel.includes('positive')) sentimentCounts.positive++;
      else if (lowerLabel.includes('bearish') || lowerLabel.includes('negative')) sentimentCounts.negative++;
      else sentimentCounts.neutral++;
    });
  } else {
    // Fallback if no events/updates: use main story sentiment
    const lowerLabel = story.sentimentLabel?.toLowerCase() || story.sentiment?.toLowerCase() || 'neutral';
    if (lowerLabel.includes('bullish') || lowerLabel.includes('positive')) sentimentCounts.positive = 1;
    else if (lowerLabel.includes('bearish') || lowerLabel.includes('negative')) sentimentCounts.negative = 1;
    else sentimentCounts.neutral = 1;
  }

  const pieData = [
    { name: 'Positive', value: sentimentCounts.positive, color: '#10b981' },
    { name: 'Neutral', value: sentimentCounts.neutral, color: '#9ca3af' },
    { name: 'Negative', value: sentimentCounts.negative, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Maturity Logic
  const maturityLevel = story.maturity === 'Mature' ? 100 : story.maturity === 'Developing' ? 50 : 25;
  const maturityLabel = story.maturity ? (story.maturity.charAt(0).toUpperCase() + story.maturity.slice(1).toLowerCase()) : 'Emerging';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-0 md:p-6">
      <div className="bg-white w-full max-w-6xl h-[100vh] md:h-[90vh] md:rounded-2xl flex flex-col shadow-2xl overflow-hidden relative">

        {/* Mobile: Sticky Top Bar for Navigation */}
        <div className="md:hidden flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-[#e5e5e5] px-4 py-3 flex items-center justify-between shadow-sm z-50">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[#1a1a1a] font-medium active:opacity-70 transition-opacity"
          >
            <div className="p-2 bg-[#f5f5f5] rounded-full">
              <X className="w-5 h-5" />
            </div>
            <span className="font-serif text-[17px]">Back to Feed</span>
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#666]" title="Share">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop: Close Button & Actions - Fixed position relative to modal */}
        <div className="hidden md:flex absolute top-6 right-6 z-50 items-center gap-3">
          <button className="p-2.5 bg-white hover:bg-[#faf9f6] rounded-full transition-colors border border-[#e5e5e5] shadow-sm text-[#666] hover:text-[#1a1a1a]" title="Print">
            <Printer className="w-4 h-4" />
          </button>
          <button className="p-2.5 bg-white hover:bg-[#faf9f6] rounded-full transition-colors border border-[#e5e5e5] shadow-sm text-[#666] hover:text-[#1a1a1a]" title="Share">
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 bg-[#1a1a1a] hover:bg-[#333] rounded-full transition-colors shadow-md border border-transparent group"
            title="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          <article className="max-w-5xl mx-auto px-5 py-8 md:px-12 md:py-16">

            {/* Header Section */}
            <header className="mb-10 md:mb-14 border-b border-[#e5e5e5] pb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                  {story.topic}
                </span>
                <span className="text-[#e5e5e5]">|</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#999]">
                  Market Wire
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#1a1a1a] leading-tight mb-6">
                {story.title}
              </h1>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 text-sm text-[#666] font-sans">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Updated {story.lastUpdated}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

              {/* Main Content Column */}
              <div className="lg:col-span-8">
                {/* Lead Paragraph */}
                {story.currentHypothesis && (
                  <div className="prose prose-lg max-w-none mb-10">
                    <p className="text-xl md:text-2xl font-serif leading-relaxed text-[#1a1a1a] border-l-4 border-[#d4af37] pl-6 italic">
                      {story.currentHypothesis.what}
                    </p>
                  </div>
                )}

                {/* Article Body */}
                <div className="prose prose-lg max-w-none font-serif text-[#333]">

                  {/* "Why" & "How" woven into narrative */}
                  {story.currentHypothesis && (
                    <>
                      <h3 className="text-xl font-bold font-sans text-[#1a1a1a] mt-8 mb-3">Understanding the Context</h3>
                      <p className="mb-6 leading-relaxed">
                        {story.currentHypothesis.why}
                      </p>

                      <h3 className="text-xl font-bold font-sans text-[#1a1a1a] mt-8 mb-3">Market Mechanisms</h3>
                      <p className="mb-6 leading-relaxed">
                        {story.currentHypothesis.how}
                      </p>
                    </>
                  )}

                  {/* Detailed Event Analysis */}
                  {story.events && story.events.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-[#e5e5e5]">
                      <h3 className="text-xl font-bold font-sans text-[#1a1a1a] mb-8">
                        Key Events Analysis
                      </h3>
                      <div className="space-y-8">
                        {story.events.map((event, idx) => (
                          <div key={idx} className="bg-[#faf9f6] p-6 rounded-lg border border-[#e5e3df]">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-[#999] mb-1">
                                  {new Date(event.date).toLocaleDateString()}
                                </div>
                                <h4 className="text-lg font-bold font-serif text-[#1a1a1a] leading-tight">
                                  {event.title}
                                </h4>
                              </div>
                              {event.sentiment?.sentiment_label && (
                                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${event.sentiment.sentiment_label === 'Bullish' ? 'bg-green-50 text-green-700 border-green-200' :
                                  event.sentiment.sentiment_label === 'Bearish' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-gray-50 text-gray-700 border-gray-200'
                                  }`}>
                                  {event.sentiment.sentiment_label}
                                </span>
                              )}
                            </div>

                            {event.sentiment && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                <div>
                                  <strong className="block font-sans font-bold text-[#1a1a1a] mb-1">What Happened</strong>
                                  <p className="font-serif text-[#666] leading-relaxed">{event.sentiment.what}</p>
                                </div>
                                <div>
                                  <strong className="block font-sans font-bold text-[#1a1a1a] mb-1">Why Method</strong>
                                  <p className="font-serif text-[#666] leading-relaxed">{event.sentiment.why}</p>
                                </div>
                                <div>
                                  <strong className="block font-sans font-bold text-[#1a1a1a] mb-1">How it Works</strong>
                                  <p className="font-serif text-[#666] leading-relaxed">{event.sentiment.how}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subreport if available */}
                  {story.subreport && (
                    <div className="mt-12 pt-8 border-t border-[#e5e5e5]">
                      {formatMarkdown(story.subreport)}
                    </div>
                  )}

                </div>
              </div>

              {/* Sidebar Column */}
              <div className="lg:col-span-4 space-y-8">

                {/* Sentiment Analysis Graph */}
                <div className="bg-white rounded-xl border border-[#e5e3df] p-6 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#999] mb-6">
                    Sentiment Analysis
                  </h4>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '4px', fontFamily: 'serif' }}
                          itemStyle={{ color: '#1a1a1a' }}
                        />
                        <Legend
                          iconType="circle"
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontFamily: 'sans-serif' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-center text-[#999] mt-4 italic">
                    Distribution of sentiment across {sourceData.length > 0 ? `${sourceData.length} data points` : 'primary analysis'}.
                  </p>
                </div>

                {/* Maturity Component */}
                <div className="bg-white rounded-xl border border-[#e5e3df] p-6 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#999] mb-4">
                    News Maturity
                  </h4>
                  <div className="relative pt-2 pb-6">
                    <div className="h-2 w-full bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#d4af37] to-[#b8941f] transition-all duration-1000 ease-out"
                        style={{ width: `${maturityLevel}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider text-[#999]">
                      <span>Emerging</span>
                      <span>Developing</span>
                      <span>Mature</span>
                    </div>
                    <div
                      className="absolute top-6 transform -translate-x-1/2 bg-[#1a1a1a] text-white text-xs font-bold px-2 py-1 rounded shadow-lg"
                      style={{ left: `${maturityLevel}%` }}
                    >
                      {maturityLabel}
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#1a1a1a] rotate-45"></div>
                    </div>
                  </div>
                  <p className="text-xs text-[#666] leading-relaxed">
                    {story.maturity === 'Mature'
                      ? 'This story has high confidence with established facts and widespread coverage.'
                      : 'This story is still developing. Information may change rapidly.'}
                  </p>
                </div>

                {/* Coverage Stats (Simplified) */}
                <div className="bg-[#faf9f6] p-6 rounded-lg border border-[#e5e3df]">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#999] mb-4">
                    Coverage Stats
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-[#e5e3df] pb-2">
                      <span className="font-serif text-[#333]">Updates</span>
                      <span className="font-bold font-sans">{story.updateCount}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-[#e5e3df] pb-2">
                      <span className="font-serif text-[#333]">Sources</span>
                      <span className="font-bold font-sans">{story.relatedEntities.length}</span>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="font-serif text-[#333] whitespace-nowrap">Category</span>
                      <span className="font-bold font-sans text-[#d4af37] text-right leading-tight">{story.topic}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
