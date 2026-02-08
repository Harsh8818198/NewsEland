import { X, Sparkles, TrendingUp, TrendingDown, Target, Shield, Printer } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalysisResultModalProps {
    analysis: any;
    isOpen: boolean;
    onClose: () => void;
    storyTitle?: string;
}

export function AnalysisResultModal({ analysis, isOpen, onClose, storyTitle }: AnalysisResultModalProps) {
    if (!analysis) return null;

    const { sentiment, cognitive, intelligence, risk, exit_strategy } = analysis;

    // Sentiment Data for Pie Chart
    const pieData = [
        { name: 'Bullish', value: sentiment?.sentiment_score > 0 ? sentiment.sentiment_score * 100 : 0, color: '#006400' },
        { name: 'Bearish', value: sentiment?.sentiment_score < 0 ? Math.abs(sentiment.sentiment_score * 100) : 0, color: '#8b0000' },
        { name: 'Neutral', value: 100 - Math.abs((sentiment?.sentiment_score || 0) * 100), color: '#9ca3af' },
    ].filter(d => d.value > 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#f5f2e9] border-2 border-[#1a1a1a] p-0 gap-0">

                {/* Header */}
                <div className="bg-[#1a1a1a] text-[#f5f2e9] p-6 sticky top-0 z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-[#d4af37]" />
                            <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                                Strategic Intelligence Report
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-serif font-bold leading-tight max-w-2xl">
                            {storyTitle || analysis.story_title || 'Analysis Result'}
                        </h2>
                        <p className="text-sm text-white/60 mt-2 font-serif">
                            Generated {new Date(analysis.analyzed_at || Date.now()).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="p-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-6 bg-transparent h-auto p-0">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#f5f2e9] bg-white border border-[#1a1a1a] rounded-none font-serif font-bold">Overview</TabsTrigger>
                            <TabsTrigger value="reasoning" className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#f5f2e9] bg-white border border-[#1a1a1a] rounded-none font-serif font-bold">Reasoning</TabsTrigger>
                            <TabsTrigger value="market" className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#f5f2e9] bg-white border border-[#1a1a1a] rounded-none font-serif font-bold">Market Impact</TabsTrigger>
                            <TabsTrigger value="strategy" className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#f5f2e9] bg-white border border-[#1a1a1a] rounded-none font-serif font-bold">Strategy</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            {/* Executive Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-6">
                                    <div className="bg-white p-6 border border-[#1a1a1a]">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-4">Bottom Line</h3>
                                        <p className="font-serif text-lg leading-relaxed">
                                            {cognitive?.so_what || sentiment?.what || "Analysis pending..."}
                                        </p>
                                    </div>

                                    {cognitive?.contrarian_angle && (
                                        <div className="bg-[#1a1a1a] text-white p-6 border border-[#1a1a1a]">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-3">Contrarian View</h3>
                                            <p className="font-serif italic leading-relaxed">
                                                "{cognitive.contrarian_angle}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {/* Sentiment Chart */}
                                    <div className="bg-white p-4 border border-[#1a1a1a]">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#6b6b6b] mb-4 text-center">Sentiment</h3>
                                        <div className="h-[150px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        innerRadius={40}
                                                        outerRadius={60}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="text-center mt-2">
                                            <span className={`text-xl font-serif font-bold ${sentiment?.sentiment_label === 'Bullish' ? 'text-[#006400]' :
                                                sentiment?.sentiment_label === 'Bearish' ? 'text-[#8b0000]' : 'text-[#6b6b6b]'
                                                }`}>
                                                {sentiment?.sentiment_label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Risk Score */}
                                    <div className="bg-white p-4 border border-[#1a1a1a] text-center">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#6b6b6b] mb-2">Risk Score</h3>
                                        <div className="text-4xl font-serif font-bold text-[#1a1a1a]">
                                            {risk?.overall_risk_score?.toFixed(1) || "N/A"}
                                            <span className="text-sm text-[#6b6b6b] font-sans font-normal">/10</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="reasoning" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 border border-[#1a1a1a]">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-4">Why it Matters</h3>
                                    <p className="font-serif text-[#4a4a4a] leading-relaxed">{sentiment?.why}</p>
                                </div>
                                <div className="bg-white p-6 border border-[#1a1a1a]">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-4">What Happened</h3>
                                    <p className="font-serif text-[#4a4a4a] leading-relaxed">{sentiment?.what}</p>
                                </div>
                                <div className="bg-white p-6 border border-[#1a1a1a]">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-4">Mechanism</h3>
                                    <p className="font-serif text-[#4a4a4a] leading-relaxed">{sentiment?.how}</p>
                                </div>
                            </div>

                            {intelligence?.competitive_landscape && (
                                <div className="bg-white p-6 border border-[#1a1a1a] mt-6">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-4">Competitive Landscape</h3>
                                    <div className="prose font-serif max-w-none">
                                        <p>{intelligence.competitive_landscape}</p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="market" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Winners */}
                                <div className="bg-white border-l-4 border-[#006400] p-6 shadow-sm">
                                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#006400] mb-4">
                                        <TrendingUp className="w-4 h-4" /> Potential Winners
                                    </h3>
                                    <div className="space-y-4">
                                        {cognitive?.winners?.map((item: any, i: number) => (
                                            <div key={i} className="pb-3 border-b border-[#ede8d8] last:border-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-[#1a1a1a]">{item.entity}</span>
                                                    <span className="text-xs font-bold bg-[#006400]/10 text-[#006400] px-2 py-0.5 rounded">
                                                        {item.expected_impact || 'Positive'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[#4a4a4a]">{item.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Losers */}
                                <div className="bg-white border-l-4 border-[#8b0000] p-6 shadow-sm">
                                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#8b0000] mb-4">
                                        <TrendingDown className="w-4 h-4" /> Potential Losers
                                    </h3>
                                    <div className="space-y-4">
                                        {cognitive?.losers?.map((item: any, i: number) => (
                                            <div key={i} className="pb-3 border-b border-[#ede8d8] last:border-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-[#1a1a1a]">{item.entity}</span>
                                                    <span className="text-xs font-bold bg-[#8b0000]/10 text-[#8b0000] px-2 py-0.5 rounded">
                                                        {item.expected_impact || 'Negative'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[#4a4a4a]">{item.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="strategy" className="space-y-6">
                            {/* Opportunities */}
                            <div className="bg-white p-6 border border-[#1a1a1a]">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-6 flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Strategic Opportunities
                                </h3>
                                <div className="space-y-4">
                                    {cognitive?.real_world_opportunities?.map((opp: any, i: number) => (
                                        <div key={i} className="flex gap-4 p-4 bg-[#faf9f6] border border-[#d4af37]">
                                            <div className="w-8 h-8 rounded-full bg-[#d4af37] text-[#1a1a1a] flex items-center justify-center font-bold font-serif shrink-0">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap gap-2 items-center mb-1">
                                                    <span className="font-bold text-[#1a1a1a]">{opp.action}</span>
                                                    <span className="text-xs uppercase bg-white border border-[#1a1a1a] px-2 py-0.5">
                                                        {opp.type?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[#4a4a4a] font-serif mb-2">{opp.reasoning}</p>
                                                <div className="flex gap-4 text-xs font-mono text-[#6b6b6b]">
                                                    <span>Est. Cost: {opp.investment}</span>
                                                    <span className="text-[#006400] font-bold">Est. Gain: {opp.expected_savings}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Exit Strategy */}
                            {exit_strategy && (
                                <div className="bg-white p-6 border border-[#1a1a1a]">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-6 flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Exit Plan
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 bg-[#f5f5f5]">
                                            <span className="text-xs uppercase tracking-wider text-[#6b6b6b] block mb-1">Primary Exit</span>
                                            <p className="font-bold text-[#1a1a1a]">{exit_strategy.primary_exit_trigger}</p>
                                        </div>
                                        <div className="p-4 bg-[#f5f5f5]">
                                            <span className="text-xs uppercase tracking-wider text-[#6b6b6b] block mb-1">Stop Loss</span>
                                            <p className="font-bold text-[#8b0000]">{exit_strategy.stop_loss_price ? `$${exit_strategy.stop_loss_price}` : 'Not set'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 bg-[#f5f5f5]">
                                        <span className="text-xs uppercase tracking-wider text-[#6b6b6b] block mb-1">Re-eval Conditions</span>
                                        <ul className="list-disc list-inside text-sm text-[#4a4a4a]">
                                            {exit_strategy.re_evaluation_conditions?.map((cond: string, i: number) => (
                                                <li key={i}>{cond}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="p-6 border-t border-[#1a1a1a] bg-[#f5f2e9] flex justify-end gap-3">
                    <Button variant="outline" className="btn-newspaper" onClick={onClose}>Close</Button>
                    <Button className="btn-newspaper bg-[#1a1a1a] text-[#f5f2e9]">
                        <Printer className="w-4 h-4 mr-2" /> Print Report
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
