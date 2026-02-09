import { useState, useEffect } from 'react';
import { FileText, Calendar, Loader2, AlertCircle } from 'lucide-react';
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

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-[#1a1a1a] pb-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">Intelligence Report Log</h1>
                    <p className="text-[#6b6b6b] mt-2 font-serif">Map of past strategic assessments and market analysis.</p>
                </div>
                <Button onClick={fetchAnalyses} variant="outline" className="btn-newspaper">
                    Refresh Log
                </Button>
            </div>

            {/* Backtest Performance Widget */}
            <div className="max-w-md">
                <BacktestWidget />
            </div>

            {error && (
                <Alert variant="destructive" className="bg-[#8b0000]/10 border-[#8b0000] text-[#8b0000]">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1a1a1a]" />
                </div>
            ) : analyses.length === 0 ? (
                <div className="text-center py-12 bg-white border border-[#1a1a1a] p-8">
                    <FileText className="h-12 w-12 mx-auto text-[#d4af37] mb-4" />
                    <h3 className="text-xl font-serif font-bold text-[#1a1a1a] mb-2">No Reports Filed</h3>
                    <p className="text-[#6b6b6b] font-serif">
                        Run analysis on a story to generate an intelligence report.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {analyses.map((analysis) => (
                        <div
                            key={analysis.story_id}
                            className="bg-white border border-[#1a1a1a] p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                            <div className="space-y-2">
                                <h3 className="text-xl font-serif font-bold text-[#1a1a1a]">
                                    {analysis.story_title}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-[#6b6b6b] font-serif">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(analysis.timestamp).toLocaleString()}
                                    </span>
                                    <span className="font-mono text-xs uppercase tracking-wider bg-[#f5f2e9] px-2 py-0.5 border border-[#1a1a1a]/20">
                                        ID: {analysis.story_id.substring(0, 8)}...
                                    </span>
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
                                View Report
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#f5f2e9] border-2 border-[#1a1a1a]">
                    <DialogHeader className="border-b border-[#1a1a1a] pb-4">
                        <DialogTitle className="font-serif text-2xl text-[#1a1a1a]">
                            {selectedAnalysis?.headline || 'Analysis Report'}
                        </DialogTitle>
                        <DialogDescription className="font-serif text-[#6b6b6b]">
                            Intelligence report from analysis logs
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAnalysis && <AnalysisReport analysis={selectedAnalysis} compact={true} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
