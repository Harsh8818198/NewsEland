import { AnalysisResult } from '@/app/types/investment';
import { X, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

interface AnalysisResultModalProps {
    analysis: AnalysisResult;
    onClose: () => void;
}

export function AnalysisResultModal({ analysis, onClose }: AnalysisResultModalProps) {
    const getSentimentIcon = () => {
        if (analysis.sentiment === 'positive') return <TrendingUp className="w-5 h-5 text-green-600" />;
        if (analysis.sentiment === 'negative') return <TrendingDown className="w-5 h-5 text-red-600" />;
        return <Minus className="w-5 h-5 text-gray-600" />;
    };

    const getSentimentColor = () => {
        if (analysis.sentiment === 'positive') return 'bg-green-50 border-green-200 text-green-800';
        if (analysis.sentiment === 'negative') return 'bg-red-50 border-red-200 text-red-800';
        return 'bg-gray-50 border-gray-200 text-gray-800';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-[#1a1a1a] px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#d4af37]" />
                        <h2 className="text-white font-bold text-lg">Analysis Results</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        title="Close"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Story Context */}
                    {analysis.storyContext && (
                        <div className="bg-[#faf9f6] border border-[#e5e3df] rounded-lg p-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#999] mb-2">Story Context</h3>
                            <p className="text-sm font-serif text-[#333]">{analysis.storyContext}</p>
                        </div>
                    )}

                    {/* Sentiment Analysis */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#999] mb-3">Sentiment Analysis</h3>
                        <div className={`flex items-center gap-3 p-4 rounded-lg border ${getSentimentColor()}`}>
                            {getSentimentIcon()}
                            <div>
                                <p className="font-bold capitalize">{analysis.sentiment}</p>
                                <p className="text-sm">Score: {(analysis.sentimentScore * 100).toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Entities */}
                    {analysis.entities.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#999] mb-3">Detected Entities</h3>
                            <div className="flex flex-wrap gap-2">
                                {analysis.entities.map((entity, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-[#d4af37]/10 text-[#1a1a1a] text-sm font-medium rounded-full border border-[#d4af37]/30"
                                    >
                                        {entity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cognitive Analysis */}
                    {analysis.cognitive_analysis && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#999] mb-3">Cognitive Insights</h3>
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-[#e5e3df] rounded-lg p-5 space-y-4">
                                {analysis.cognitive_analysis.so_what && (
                                    <div>
                                        <h4 className="font-bold text-sm text-[#1a1a1a] mb-2">Key Insight</h4>
                                        <p className="text-sm font-serif text-[#333] leading-relaxed">{analysis.cognitive_analysis.so_what}</p>
                                    </div>
                                )}

                                {analysis.cognitive_analysis.winners && analysis.cognitive_analysis.winners.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-sm text-emerald-700 mb-2">Winners</h4>
                                        <div className="space-y-2">
                                            {analysis.cognitive_analysis.winners.map((winner, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded border border-emerald-100">
                                                    <p className="font-bold text-sm text-[#1a1a1a]">{winner.entity}</p>
                                                    <p className="text-xs text-[#666] mt-1">{winner.reason}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {analysis.cognitive_analysis.losers && analysis.cognitive_analysis.losers.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-sm text-rose-700 mb-2">Losers</h4>
                                        <div className="space-y-2">
                                            {analysis.cognitive_analysis.losers.map((loser, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded border border-rose-100">
                                                    <p className="font-bold text-sm text-[#1a1a1a]">{loser.entity}</p>
                                                    <p className="text-xs text-[#666] mt-1">{loser.reason}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Personalized Advice */}
                    {analysis.personalizedAdvice && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#999] mb-3">Strategic Advice</h3>
                            <div className="bg-[#1a1a1a] text-white p-5 rounded-lg">
                                <div className="prose prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                                        {analysis.personalizedAdvice}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-[#e5e5e5] px-6 py-4 bg-[#faf9f6]">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-[#1a1a1a] text-white font-semibold rounded-lg hover:bg-[#333] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
