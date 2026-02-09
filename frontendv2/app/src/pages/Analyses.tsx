import { useState, useEffect } from 'react';
import { FileText, Calendar, Loader2, AlertCircle, Brain, Target, Award, Activity } from 'lucide-react';
import { getApiClient, ApiError, type AnalysisSummary } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AnalysisReport from '@/components/AnalysisReport';
import { BacktestWidget } from '@/components/BacktestWidget';

export function Analyses() {
    const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchAnalyses();
    }, []);

    const fetchAnalyses = async () => {
        try {
            setLoading(true);
            const api = getApiClient();
            const response = await api.getAnalyses();
            if (response.success) {
                setAnalyses(response.analyses);
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.userMessage);
            } else {
                setError('Failed to load analysis logs');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewAnalysis = async (storyId: string) => {
        try {
            setModalLoading(true);
            const api = getApiClient();
            const response = await api.getAnalysis(storyId);

            if (response.success && response.exists && response.analysis) {
                const stored = response.analysis;
                // Unwrap storage wrapper if present
                const analysisObj = stored && (stored.analysis || stored.analysis === null) ? stored.analysis || null : stored;
                setSelectedAnalysis(analysisObj);
                setIsModalOpen(true);
            } else {
                setError('Analysis details not found');
            }
        } catch (err) {
            console.error('Failed to load analysis details:', err);
        } finally {
            setModalLoading(false);
        }
    };

    // Calculate stats from analyses
    const totalReports = analyses.length;
    const bullishCount = analyses.filter(a => a.story_title?.toLowerCase().includes('bull')).length;
    const recentReports = analyses.filter(a => {
        const daysSince = (Date.now() - new Date(a.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
    }).length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="border-b-4 border-[#1a1a1a] pb-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <FileText className="h-8 w-8 text-[#1a1a1a]" />
                    <h1 className="headline-main text-center">Intelligence Report Log</h1>
                    <FileText className="h-8 w-8 text-[#1a1a1a]" />
                </div>
                <p className="text-center font-serif text-[#6b6b6b] mt-2 italic">
                    Archive of Strategic Assessments & Market Intelligence
                </p>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border-2 border-[#1a1a1a] p-4 text-center bg-[#f5f2e9]">
                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Total Reports</p>
                    <p className="text-3xl font-bold font-serif text-[#1a1a1a]">{totalReports}</p>
                    <p className="text-xs text-[#6b6b6b] font-serif mt-1">Filed</p>
                </div>

                <div className="border-2 border-[#1a1a1a] p-4 text-center bg-[#f5f2e9]">
                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">This Week</p>
                    <p className="text-3xl font-bold font-serif text-[#1a1a1a]">{recentReports}</p>
                    <p className="text-xs text-[#6b6b6b] font-serif mt-1">Recent</p>
                </div>

                <div className="border-2 border-[#1a1a1a] p-4 text-center bg-[#f5f2e9]">
                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Bullish Signals</p>
                    <p className="text-3xl font-bold font-serif text-[#006400]">{bullishCount}</p>
                    <p className="text-xs text-[#6b6b6b] font-serif mt-1">Identified</p>
                </div>

                <div className="border-2 border-[#1a1a1a] p-4 text-center bg-[#f5f2e9]">
                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">AI Analysis</p>
                    <p className="text-3xl font-bold font-serif text-[#1a1a1a]">
                        <Brain className="h-8 w-8 mx-auto" />
                    </p>
                    <p className="text-xs text-[#6b6b6b] font-serif mt-1">Powered</p>
                </div>
            </div>

            {/* Backtest Performance Widget */}
            <div className="border-2 border-[#1a1a1a] p-6 bg-[#ede8d8]">
                <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b-2 border-[#1a1a1a] pb-3 mb-4 flex items-center justify-center gap-2">
                    <Activity className="h-4 w-4" />
                    Performance Tracking
                </h4>
                <BacktestWidget />
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="tag-newspaper">{totalReports} Reports</span>
                    {recentReports > 0 && (
                        <span className="tag-newspaper bg-[#006400] text-[#f5f2e9]">
                            {recentReports} New This Week
                        </span>
                    )}
                </div>
                <Button onClick={fetchAnalyses} variant="outline" className="btn-newspaper">
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh Log
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="bg-[#8b0000]/10 border-[#8b0000] text-[#8b0000]">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-serif">{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div className="flex flex-col justify-center items-center py-12 border-2 border-[#1a1a1a] bg-[#f5f2e9]">
                    <Loader2 className="h-12 w-12 animate-spin text-[#1a1a1a] mb-4" />
                    <p className="font-serif text-[#6b6b6b]">Loading intelligence reports...</p>
                </div>
            ) : analyses.length === 0 ? (
                <div className="text-center py-16 bg-white border-2 border-[#1a1a1a] p-8">
                    <FileText className="h-16 w-16 mx-auto text-[#d4af37] mb-6" />
                    <h3 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-3">No Reports Filed</h3>
                    <p className="text-[#6b6b6b] font-serif mb-6 max-w-md mx-auto">
                        Intelligence reports are generated when you analyze stories. Start by analyzing a story from the Stories page.
                    </p>
                    <div className="flex flex-col gap-2 max-w-sm mx-auto text-left">
                        <div className="flex items-start gap-3 p-3 border border-[#1a1a1a] bg-[#f5f2e9]">
                            <Target className="h-5 w-5 text-[#1a1a1a] mt-0.5" />
                            <div>
                                <p className="font-serif font-bold text-sm">Step 1: Find Stories</p>
                                <p className="font-serif text-xs text-[#6b6b6b]">Browse stories on the Stories page</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 border border-[#1a1a1a] bg-[#f5f2e9]">
                            <Brain className="h-5 w-5 text-[#1a1a1a] mt-0.5" />
                            <div>
                                <p className="font-serif font-bold text-sm">Step 2: Analyze</p>
                                <p className="font-serif text-xs text-[#6b6b6b]">Click "Analyze Story" to generate report</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 border border-[#1a1a1a] bg-[#f5f2e9]">
                            <Award className="h-5 w-5 text-[#1a1a1a] mt-0.5" />
                            <div>
                                <p className="font-serif font-bold text-sm">Step 3: Review</p>
                                <p className="font-serif text-xs text-[#6b6b6b]">Reports appear here for review</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-[#1a1a1a] border-b border-[#1a1a1a] pb-2">
                        Analysis Archive ({analyses.length})
                    </h3>
                    <div className="grid gap-4">
                        {analyses.map((analysis, index) => (
                            <div
                                key={analysis.story_id}
                                className="bg-white border-2 border-[#1a1a1a] p-6 hover:shadow-lg transition-all hover:translate-x-1"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 border-2 border-[#1a1a1a] flex items-center justify-center bg-[#ede8d8]">
                                                <span className="font-serif font-bold text-sm">#{index + 1}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-serif font-bold text-[#1a1a1a] mb-2">
                                                    {analysis.story_title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-[#6b6b6b] font-serif">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(analysis.timestamp).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                    <span className="font-mono text-xs uppercase tracking-wider bg-[#f5f2e9] px-2 py-0.5 border border-[#1a1a1a]/20">
                                                        ID: {analysis.story_id.substring(0, 12)}...
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleViewAnalysis(analysis.story_id)}
                                        className="btn-newspaper bg-[#1a1a1a] text-[#f5f2e9] shrink-0"
                                        disabled={modalLoading}
                                    >
                                        {modalLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <FileText className="h-4 w-4 mr-2" />
                                        )}
                                        View Full Report
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#f5f2e9] border-4 border-[#1a1a1a]">
                    <DialogHeader className="border-b-2 border-[#1a1a1a] pb-4">
                        <DialogTitle className="font-serif text-3xl text-[#1a1a1a] flex items-center gap-3">
                            <FileText className="h-8 w-8" />
                            {selectedAnalysis?.headline || 'Intelligence Report'}
                        </DialogTitle>
                        <DialogDescription className="font-serif text-[#6b6b6b] text-base">
                            Comprehensive analysis from AI intelligence system
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAnalysis && <AnalysisReport analysis={selectedAnalysis} compact={false} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
