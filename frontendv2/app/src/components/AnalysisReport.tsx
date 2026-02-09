import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { AnalysisResponse } from '@/services/api';

interface AnalysisReportProps {
    analysis: AnalysisResponse | any;
    compact?: boolean;
}

export default function AnalysisReport({ analysis, compact = false }: AnalysisReportProps) {
    const analysisData = analysis as any;
const sentimentConfig = {
        Bullish: { icon: TrendingUp, color: 'text-[#006400]', bg: 'bg-[#006400]', label: 'Bullish' },
        Bearish: { icon: TrendingDown, color: 'text-[#8b0000]', bg: 'bg-[#8b0000]', label: 'Bearish' },
        Neutral: { icon: Minus, color: 'text-[#4a4a4a]', bg: 'bg-[#4a4a4a]', label: 'Neutral' },
    };

    if (!analysisData) {
        return <div className="p-4 text-sm text-[#6b6b6b]">No analysis available.</div>;
    }

    // Normalize fields from different backend shapes
    const headline = analysisData.headline || analysisData.story_title || (analysisData.sentiment && analysisData.sentiment.article && analysisData.sentiment.article.title) || '';

    // Sentiment may be returned as api-friendly { sentiment: { score, label } }
    // or as the internal backend shape: sentiment.analysis.sentiment.sentiment_label / sentiment_score
    const sentimentLabel = (analysisData.sentiment && (analysisData.sentiment.label || (analysisData.sentiment.analysis && analysisData.sentiment.analysis.sentiment && analysisData.sentiment.analysis.sentiment.sentiment_label))) || 'Neutral';
    const sentimentLabelStr = typeof sentimentLabel === 'string' ? sentimentLabel : 'Neutral';
    const sentiment = sentimentConfig[sentimentLabelStr as keyof typeof sentimentConfig] || sentimentConfig.Neutral;
    const SentimentIcon = sentiment.icon;

    const sentimentScore: number = (() => {
        const s1 = (analysisData.sentiment && typeof (analysisData.sentiment.score) === 'number' && analysisData.sentiment.score) as any;
        if (typeof s1 === 'number') return s1;
        const s2 = (analysisData.sentiment && analysisData.sentiment.analysis && analysisData.sentiment.analysis.sentiment && analysisData.sentiment.analysis.sentiment.sentiment_score) as any;
        if (typeof s2 === 'number') return s2;
        const s3 = analysisData.sentimentScore;
        if (typeof s3 === 'number') return s3;
        return 0;
    })();

    const cognitive = analysisData.cognitive || analysisData.cognitive_analysis || {};

    // Deep sentiment details (why/what/how) can be nested under sentiment.analysis.sentiment
    const sentimentDetails = analysisData.sentiment?.analysis?.sentiment || analysisData.sentiment?.analysis || analysisData.sentiment || {};

    // Normalize conviction to 0..1 (backend may use 1-10 scale)
    const rawConviction = cognitive?.conviction;
    const conviction = typeof rawConviction === 'number' ? (rawConviction > 1 ? rawConviction / 10 : rawConviction) : undefined;

    if (compact) {
        // Brief report for Stories page
        return (
            <div className="space-y-5 bg-[#f5f2e9] p-4">
                {/* Header Section */}
                <div className="border-b-2 border-[#1a1a1a] pb-4">
                    <h3 className="headline-main text-xl mb-3">{headline}</h3>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 ${sentiment.bg} text-[#f5f2e9] text-xs font-serif font-bold`}>
                            <SentimentIcon className="h-3 w-3" />
                            {sentiment.label}
                        </div>
                        <span className="font-serif text-[#6b6b6b] text-sm">
                            Confidence: {(sentimentScore * 100).toFixed(0)}%
                        </span>
                        {typeof conviction === 'number' && (
                            <span className="ml-2 text-sm font-serif text-[#6b6b6b]">Conviction: {(conviction * 100).toFixed(0)}%</span>
                        )}
                    </div>
                </div>

                {/* Short narrative */}
                <div className="prose-like space-y-3">
                    {cognitive?.so_what ? (
                        <div>
                            <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2 font-bold">Strategic Insight</p>
                            <p className="article-text leading-relaxed text-sm">{cognitive.so_what}</p>
                        </div>
                    ) : sentimentDetails?.what ? (
                        <div>
                            <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2 font-bold">Summary</p>
                            <p className="article-text leading-relaxed text-sm">{sentimentDetails.what}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-[#6b6b6b]">Generated analysis</p>
                    )}
                </div>
            </div>
        );
    }

    // Full report for Analyzer page
    return (
        <div className="bg-[#f5f2e9] space-y-6 animate-in fade-in duration-500">
            {/* Masthead-style header */}
            <div className="border-b-4 border-[#1a1a1a] pb-6">
                <p className="text-xs uppercase tracking-wider text-[#d4af37] font-serif mb-2">Market Analysis</p>
                <h1 className="headline-main text-3xl mb-4">{headline}</h1>
                <div className="flex items-center gap-6 flex-wrap">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 ${sentiment.bg} text-[#f5f2e9] font-serif`}>
                        <SentimentIcon className="h-5 w-5" />
                        <span className="font-bold">{sentiment.label}</span>
                    </div>
                    <div className="text-sm font-serif">
                        <span className="text-[#6b6b6b]">Confidence: </span>
                        <span className="text-[#1a1a1a] font-bold">{(sentimentScore * 100).toFixed(1)}%</span>
                    </div>
                    {analysis.story_context?.maturity && (
                        <div className="text-sm font-serif">
                            <span className="text-[#6b6b6b]">Maturity: </span>
                            <span className="text-[#1a1a1a] font-bold">{analysis.story_context.maturity}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main article body */}
            <div className="space-y-6">
                {/* Strategic Summary */}
                {(cognitive?.so_what || sentimentDetails?.why) && (
                    <section className="border-l-4 border-[#d4af37] pl-6">
                        <h3 className="text-sm uppercase tracking-wider font-serif font-bold text-[#1a1a1a] mb-3">
                            Strategic Recommendation
                        </h3>
                        <p className="article-text text-lg leading-relaxed">{cognitive?.so_what || sentimentDetails?.why}</p>
                    </section>
                )}

                {/* Full Analysis Report */}
                {sentimentDetails && (
                    <section>
                        <h3 className="text-sm uppercase tracking-wider font-serif font-bold text-[#1a1a1a] mb-4 pb-2 border-b-2 border-[#1a1a1a]">
                            Full Analysis Report
                        </h3>
                        <div className="article-text leading-relaxed space-y-4">
                            {sentimentDetails.why && (
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Why</p>
                                    <p className="article-text mb-3">{sentimentDetails.why}</p>
                                </div>
                            )}
                            {sentimentDetails.what && (
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">What</p>
                                    <p className="article-text mb-3">{sentimentDetails.what}</p>
                                </div>
                            )}
                            {sentimentDetails.how && (
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">How</p>
                                    <p className="article-text mb-3">{sentimentDetails.how}</p>
                                </div>
                            )}
                            {sentimentDetails.expected_impact && (
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Expected Impact</p>
                                    <p className="article-text mb-3">{sentimentDetails.expected_impact}</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Cognitive Insights */}
                {cognitive && Object.keys(cognitive).length > 0 && (
                    <section className="border-t-2 border-[#1a1a1a] pt-6">
                        <h3 className="text-sm uppercase tracking-wider font-serif font-bold text-[#1a1a1a] mb-4">
                            Cognitive Analysis
                        </h3>
                        <div className="space-y-4">
                            {typeof conviction === 'number' && (
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2 font-bold">
                                        Conviction Level
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-3 border border-[#1a1a1a] bg-[#f5f2e9]">
                                            <div
                                                className="h-full bg-[#006400]"
                                                style={{ width: `${(conviction ?? 0) * 100}%` }}
                                            />
                                        </div>
                                        <span className="font-serif font-bold min-w-[60px]">
                                            {((conviction ?? 0) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            )}

                            {cognitive.contrarian_angle && (
                                <div className="bg-[#ede8d8] p-4 border border-[#1a1a1a]">
                                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2 font-bold">
                                        Contrarian View
                                    </p>
                                    <p className="article-text">{cognitive.contrarian_angle}</p>
                                </div>
                            )}

                            {cognitive.winners && cognitive.winners.length > 0 && (
                                <div className="pt-4">
                                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2 font-bold">Winners</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {cognitive.winners.map((w: any, idx: number) => (
                                            <div key={idx} className="border border-[#1a1a1a] p-3 bg-white">
                                                <p className="font-serif font-bold text-[#006400] mb-1">{w.entity || w.name}</p>
                                                <p className="text-sm text-[#4a4a4a]">{w.reason}</p>
                                                {w.expected_impact && <p className="text-xs mt-2">{w.expected_impact}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {cognitive.losers && cognitive.losers.length > 0 && (
                                <div className="pt-4">
                                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2 font-bold">Losers</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {cognitive.losers.map((l: any, idx: number) => (
                                            <div key={idx} className="border border-[#1a1a1a] p-3 bg-white">
                                                <p className="font-serif font-bold text-[#8b0000] mb-1">{l.entity || l.name}</p>
                                                <p className="text-sm text-[#4a4a4a]">{l.reason}</p>
                                                {l.expected_impact && <p className="text-xs mt-2">{l.expected_impact}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Metadata Footer */}
                <div className="border-t-2 border-[#1a1a1a] pt-4 mt-8 text-xs text-[#6b6b6b] font-serif">
                    <p>Story ID: <span className="font-mono text-[10px]">{analysis.story_id || analysis.story_title || ''}</span></p>
                    {analysis.analyzed_at && (
                        <p>Analyzed: <span className="font-bold">{new Date(analysis.analyzed_at).toLocaleString()}</span></p>
                    )}
                    {analysis.story_context?.topic && (
                        <p>Topic: <span className="font-bold">{analysis.story_context.topic}</span></p>
                    )}
                </div>
            </div>
        </div >
    );
}
