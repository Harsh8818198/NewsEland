import { useState, useEffect } from 'react';
import { AlertCircle, Sparkles, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getApiClient, ApiError } from '@/services/api';
import type { AnalysisResponse, AnalysisSummary } from '@/services/api';
import AnalysisReport from '@/components/AnalysisReport';
import { toast } from 'sonner';

export function Analyzer() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoadingAnalyses(true);
      const api = getApiClient();
      const response = await api.getAnalyses();
      if (response.success) {
        setAnalyses(response.analyses);
      }
    } catch (err) {
      console.error('Failed to load analyses:', err);
    } finally {
      setLoadingAnalyses(false);
    }
  };

  const handleViewAnalysis = async (storyId: string) => {
    try {
      const api = getApiClient();
      const response = await api.getAnalysis(storyId);

      if (response.success && response.exists && response.analysis) {
        const stored = response.analysis;
        const analysisObj = stored && (stored.analysis || stored.analysis === null) ? stored.analysis || null : stored;
        setSelectedAnalysis(analysisObj);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load analysis details:', err);
      toast.error('Failed to load analysis details');
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter a headline or text to analyze');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();
      const result = await api.analyzeText({ text: text.trim() });
      setAnalysis(result);
      toast.success('Analysis completed');
      await fetchAnalyses(); // Refresh the analyses list
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
        toast.error(err.userMessage);
      } else {
        setError('Failed to analyze text');
        toast.error('Failed to analyze text');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b-2 border-[#1a1a1a] pb-4 text-center">
        <h1 className="headline-main">The Intelligence Desk</h1>
        <p className="font-serif text-[#6b6b6b] mt-2">
          Submit headlines and news for AI-powered market analysis
        </p>
      </div>

      {/* Input Section */}
      <div className="border-2 border-[#1a1a1a] p-6 bg-[#ede8d8]">
        <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
          Submit for Analysis
        </h4>

        <Textarea
          placeholder="Enter a news headline, article excerpt, or market rumor for analysis..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px] newspaper-input mb-4"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs font-serif text-[#6b6b6b]">
            {text.length} characters
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={loading || (!text && !analysis)}
              className="btn-newspaper"
            >
              Clear
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="btn-newspaper bg-[#1a1a1a] text-[#f5f2e9]"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-[#8b0000]/10 border-[#8b0000] text-[#8b0000]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      {/* Analysis Results */}
      {analysis && <AnalysisReport analysis={analysis} compact={false} />}

      {/* Analysis History */}
      <div className="border-t-2 border-[#1a1a1a] pt-8">
        <h3 className="section-header mb-6">Analysis History</h3>

        {loadingAnalyses ? (
          <div className="text-center py-8">
            <p className="font-serif text-[#6b6b6b]">Loading analysis history...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="border border-[#1a1a1a] p-8 text-center bg-[#ede8d8]">
            <p className="font-serif text-[#6b6b6b]">No analyses yet. Start by submitting a headline above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((record) => (
              <div
                key={record.story_id}
                className="border border-[#1a1a1a] p-4 hover:bg-[#ede8d8] transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-[#1a1a1a] mb-1 truncate">
                    {record.story_title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#6b6b6b] font-serif">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(record.timestamp).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider bg-[#f5f2e9] px-2 py-0.5 border border-[#1a1a1a]/20">
                      {record.story_id.substring(0, 8)}...
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleViewAnalysis(record.story_id)}
                  className="btn-newspaper bg-[#1a1a1a] text-[#f5f2e9] shrink-0"
                >
                  View Report
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#f5f2e9] border-2 border-[#1a1a1a]">
          <DialogHeader className="border-b border-[#1a1a1a] pb-4">
            <DialogTitle className="font-serif text-2xl text-[#1a1a1a]">
              {selectedAnalysis?.headline || 'Analysis Report'}
            </DialogTitle>
            <DialogDescription className="font-serif text-[#6b6b6b]">
              From your analysis history
            </DialogDescription>
          </DialogHeader>
          {selectedAnalysis && <AnalysisReport analysis={selectedAnalysis} compact={true} />}
        </DialogContent>
      </Dialog>
    </div>);
}