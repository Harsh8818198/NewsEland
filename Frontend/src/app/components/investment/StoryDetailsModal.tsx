import { Story } from '@/app/types/investment';
import { X, Clock, Calendar, Share2, Printer, ChevronDown, ChevronUp, Archive, DollarSign, Activity } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import React, { useState } from 'react';
import { useApiContext } from '../../services/apiContext';

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
  const { actions } = useApiContext();
  const [isArchiving, setIsArchiving] = useState(false);
  const [isEditingThesis, setIsEditingThesis] = useState(false);
  const [thesisConviction, setThesisConviction] = useState(story.cognitive_analysis?.conviction || 5);
  const [thesisContrarian, setThesisContrarian] = useState(story.cognitive_analysis?.contrarian_angle || '');

  const handleUpdateThesis = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/stories/${story.id}/thesis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conviction: thesisConviction,
          contrarian_angle: thesisContrarian
        })
      });
      if (response.ok) {
        setIsEditingThesis(false);
        actions.fetchStories(); // Refresh data
        alert('Thesis updated successfully');
      } else {
        alert('Failed to update thesis');
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('Error updating thesis');
    }
  };

  const handleArchive = async () => {
    if (confirm('Are you sure you want to archive this story?')) {
      try {
        setIsArchiving(true);
        const response = await fetch(`http://localhost:8000/api/stories/${story.id}/archive`, { method: 'POST' });
        if (response.ok) {
          onClose(); // Close modal on success
          // Ideally refresh stories list here
          actions.fetchStories();
        }
      } catch (error) {
        console.error('Failed to archive:', error);
      } finally {
        setIsArchiving(false);
      }
    }
  };

  const handleTrade = (ticker: string) => {
    // This would typically open a trade modal. For now, we'll just log or alert.
    // In a real app, you'd open a "New Order" modal pre-filled with ticker and story_id.
    console.log(`Initiating trade for ${ticker} linked to story ${story.id}`);
    alert(`Opening trade ticket for ${ticker} (Linked to Story ID: ${story.id})`);
  };

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

  const cognitive = story.cognitive_analysis;

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
          <button
            onClick={handleArchive}
            disabled={isArchiving}
            className="p-2.5 bg-white hover:bg-[#faf9f6] rounded-full transition-colors border border-[#e5e5e5] shadow-sm text-[#666] hover:text-red-600 disabled:opacity-50"
            title="Archive Story"
          >
            <Archive className="w-4 h-4" />
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

                {/* --- PROFIT LOGIC SECTION (NEW) --- */}
                {cognitive && (
                  <div className="mb-12 bg-[#faf9f6] border border-[#e5e3df] rounded-xl overflow-hidden">
                    <div className="bg-[#1a1a1a] px-6 py-4 flex justify-between items-center">
                      <h3 className="text-white font-bold tracking-wider uppercase text-sm flex items-center gap-2">
                        <span className="text-[#d4af37]">✦</span> Profit Logic
                      </h3>
                      <div className="flex items-center gap-3">
                        {isEditingThesis ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleUpdateThesis}
                              className="px-3 py-1 bg-[#d4af37] text-[#1a1a1a] text-xs font-bold rounded hover:bg-[#b8941f]"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setIsEditingThesis(false)}
                              className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded hover:bg-white/20"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsEditingThesis(true)}
                            className="text-[10px] text-white/60 hover:text-white underline"
                          >
                            Edit Thesis
                          </button>
                        )}
                        <span className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded border border-white/20">
                          Conviction: {cognitive.conviction}/10
                        </span>
                      </div>
                    </div>

                    {isEditingThesis && (
                      <div className="bg-[#1a1a1a] border-t border-white/10 p-6">
                        <div className="mb-4">
                          <label className="block text-white/60 text-xs font-bold uppercase mb-2">Conviction Score (1-10)</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={thesisConviction}
                            onChange={(e) => setThesisConviction(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>
                        <div>
                          <label className="block text-white/60 text-xs font-bold uppercase mb-2">Contrarian Angle</label>
                          <textarea
                            value={thesisContrarian}
                            onChange={(e) => setThesisContrarian(e.target.value)}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                            placeholder="Enter the contrarian view..."
                          />
                        </div>
                      </div>
                    )}

                    <div className="p-6 md:p-8">
                      {/* So What? */}
                      <div className="mb-8">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-[#999] mb-3">The Bottom Line</h4>
                        <p className="text-xl font-serif leading-relaxed text-[#1a1a1a]">
                          {cognitive.so_what}
                        </p>
                      </div>

                      {/* Winners & Losers Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Winners */}
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-700 mb-4 border-b border-emerald-100 pb-2">
                            <ChevronUp className="w-4 h-4" /> Winners
                          </h4>
                          <div className="space-y-4">
                            {cognitive.winners.map((winner, idx) => (
                              <div key={idx} className="bg-white p-4 rounded border border-[#e5e3df] shadow-sm">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-[#1a1a1a]">{winner.entity}</span>
                                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    {winner.expected_impact}
                                  </span>
                                </div>
                                <div className="flex justify-between items-end mt-1">
                                  <p className="text-sm text-[#666] leading-snug flex-1">{winner.reason}</p>
                                  <button
                                    onClick={() => handleTrade(winner.entity)}
                                    className="ml-2 p-1 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors"
                                    title="Trade this Asset"
                                  >
                                    <DollarSign className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {cognitive.winners.length === 0 && <p className="text-sm text-[#999] italic">None identified yet.</p>}
                          </div>
                        </div>

                        {/* Losers */}
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-rose-700 mb-4 border-b border-rose-100 pb-2">
                            <ChevronDown className="w-4 h-4" /> Losers
                          </h4>
                          <div className="space-y-4">
                            {cognitive.losers.map((loser, idx) => (
                              <div key={idx} className="bg-white p-4 rounded border border-[#e5e3df] shadow-sm">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-[#1a1a1a]">{loser.entity}</span>
                                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                    {loser.expected_impact}
                                  </span>
                                </div>
                                <p className="text-sm text-[#666] leading-snug">{loser.reason}</p>
                              </div>
                            ))}
                            {cognitive.losers.length === 0 && <p className="text-sm text-[#999] italic">None identified yet.</p>}
                          </div>
                        </div>
                      </div>

                      {/* Real World Opportunities */}
                      {cognitive.real_world_opportunities?.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-[#e5e3df]">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-4 flex items-center gap-2">
                            🌍 Real-World Actions
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            {cognitive.real_world_opportunities.map((opp, idx) => (
                              <div key={idx} className="flex gap-4 p-4 bg-amber-50/50 border border-amber-100 rounded-lg">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                                    {idx + 1}
                                  </div>
                                </div>
                                <div>
                                  <div className="flex flex-wrap gap-2 items-center mb-1">
                                    <span className="font-bold text-[#1a1a1a]">{opp.action}</span>
                                    <span className="text-[10px] font-bold uppercase bg-white border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                                      {opp.type.replace('_', ' ')}
                                    </span>
                                    {opp.timing.includes('URGENT') && (
                                      <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded animate-pulse">
                                        Urgent
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-[#555] mb-2">{opp.reasoning}</p>
                                  <div className="flex gap-4 text-xs text-[#777] font-sans">
                                    <span>Investment: <strong>{opp.investment}</strong></span>
                                    <span>Est. Gain: <strong>{opp.expected_savings}</strong></span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}


                {/* Lead Paragraph (Hypothesis) */}
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

                {/* Contrarian Angle (NEW) */}
                {cognitive?.contrarian_angle && (
                  <div className="bg-[#1a1a1a] text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Share2 className="w-24 h-24" />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-3 relative z-10">
                      The Contrarian View
                    </h4>
                    <p className="font-serif text-lg leading-relaxed relative z-10">
                      "{cognitive.contrarian_angle}"
                    </p>
                  </div>
                )}

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

                  {story.maturityAssessment && (
                    <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-[#333]">Confidence Score</span>
                        <span className="text-xs font-mono font-bold">{story.maturityAssessment.confidence.toFixed(1)}/1.0</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#f0f0f0] rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-[#1a1a1a]"
                          style={{ width: `${story.maturityAssessment.confidence * 100}%` }}
                        />
                      </div>
                      <div className="flex gap-4 text-xs text-[#666]">
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {story.maturityAssessment.evidence_count} Evidence Points</span>
                      </div>
                      {story.maturityAssessment.missing_factors.length > 0 && (
                        <div className="mt-3">
                          <span className="text-[10px] font-bold uppercase text-[#999] block mb-1">Missing Factors</span>
                          <div className="flex flex-wrap gap-1">
                            {story.maturityAssessment.missing_factors.map((factor, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] rounded border border-red-100">
                                {factor}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
