import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, RefreshCw, Archive, AlertCircle, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getApiClient, ApiError } from '@/services/api';
import type { BackendStory, SubreportResponse } from '@/services/api';
import { toast } from 'sonner';

import AnalysisReport from '@/components/AnalysisReport';

function HypothesisSection({ hypothesis, title }: { hypothesis: any; title: string }) {
  if (!hypothesis) return null;

  const sentimentScore = typeof hypothesis.sentiment_score === 'number' ? hypothesis.sentiment_score : 0;

  return (
    <div className="border border-[#1a1a1a] p-6 mb-6">
      <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
        {title}
      </h4>

      <div className="flex items-center gap-4 mb-4">
        <span className={`tag-newspaper ${hypothesis.sentiment_label === 'Bullish' ? 'bg-[#006400] text-[#f5f2e9]' :
          hypothesis.sentiment_label === 'Bearish' ? 'bg-[#8b0000] text-[#f5f2e9]' :
            'bg-[#4a4a4a] text-[#f5f2e9]'
          }`}>
          {hypothesis.sentiment_label}
        </span>
        <span className="text-sm font-serif text-[#6b6b6b]">
          Confidence: {(sentimentScore * 100).toFixed(1)}%
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Why</p>
          <p className="article-text">{hypothesis.why}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">What</p>
          <p className="article-text">{hypothesis.what}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">How</p>
          <p className="article-text">{hypothesis.how}</p>
        </div>
        <div className="border-t border-[#1a1a1a] pt-4 mt-4">
          <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Expected Impact</p>
          <p className="article-text font-medium">{hypothesis.expected_impact}</p>
        </div>
      </div>
    </div>
  );
}

function EventsTimeline({ events }: { events: any[] }) {
  return (
    <div className="border border-[#1a1a1a] p-6">
      <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-6">
        Chronicle of Events
      </h4>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4 pb-4 border-b border-[#ede8d8] last:border-0">
            <div className="w-24 shrink-0">
              <p className="text-xs font-serif text-[#6b6b6b]">
                {new Date(event.date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex-1">
              <p className="font-serif font-medium text-[#1a1a1a] mb-1">{event.title}</p>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${event.sentiment?.label === 'Bullish' ? 'text-[#006400]' :
                  event.sentiment?.label === 'Bearish' ? 'text-[#8b0000]' :
                    'text-[#4a4a4a]'
                  }`}>
                  {event.sentiment?.label || 'Neutral'}
                </span>
                {event.pattern && (
                  <span className="tag-newspaper text-xs">{event.pattern}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<BackendStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subreport, setSubreport] = useState<SubreportResponse | null>(null);
  const [cognitive, setCognitive] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any>(null);
  const [winnersLosers, setWinnersLosers] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [exitStrategy, setExitStrategy] = useState<any>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  const fetchStoryData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();

      const storiesData = await api.getStories();
      const foundStory = storiesData.stories.find(s => s.id === id);

      if (!foundStory) {
        setError('Story not found');
        return;
      }

      setStory(foundStory);

      const [subreportData, cognitiveData, opportunitiesData, winnersLosersData, riskData, exitData, analysisData] = await Promise.allSettled([
        api.getSubreport(id),
        api.getCognitiveAnalysis(id),
        api.getOpportunities(id),
        api.getWinnersLosers(id),
        api.getRiskAssessment(id),
        api.getExitStrategy(id),
        fetch(`http://localhost:8000/api/stories/${id}/analysis`).then(r => r.json()),
      ]);

      console.log('API Responses:', {
        subreport: subreportData.status,
        cognitive: cognitiveData.status,
        opportunities: opportunitiesData.status,
        winnersLosers: winnersLosersData.status,
        risk: riskData.status,
        exit: exitData.status
      });

      if (subreportData.status === 'fulfilled') setSubreport(subreportData.value);
      else console.error('Subreport failed:', subreportData.status === 'rejected' ? subreportData.reason : 'unknown');

      if (cognitiveData.status === 'fulfilled') setCognitive(cognitiveData.value);
      else console.error('Cognitive failed:', cognitiveData.status === 'rejected' ? cognitiveData.reason : 'unknown');

      if (opportunitiesData.status === 'fulfilled') setOpportunities(opportunitiesData.value);
      else console.error('Opportunities failed:', opportunitiesData.status === 'rejected' ? opportunitiesData.reason : 'unknown');

      if (winnersLosersData.status === 'fulfilled') setWinnersLosers(winnersLosersData.value);
      else console.error('Winners/Losers failed:', winnersLosersData.status === 'rejected' ? winnersLosersData.reason : 'unknown');

      if (riskData.status === 'fulfilled') setRisk(riskData.value);
      else console.error('Risk failed:', riskData.status === 'rejected' ? riskData.reason : 'unknown');

      if (exitData.status === 'fulfilled') setExitStrategy(exitData.value);
      else console.error('Exit strategy failed:', exitData.status === 'rejected' ? exitData.reason : 'unknown');

      // Check if analysis exists and unwrap stored structure
      if (analysisData.status === 'fulfilled' && analysisData.value.exists) {
        setHasAnalysis(true);
        const stored = analysisData.value.analysis;
        // Stored entry may be { timestamp, story_title, analysis, user_notes }
        // If so, unwrap the inner `analysis` field; otherwise use as-is.
        if (stored && (stored.analysis || stored.analysis === null)) {
          setAnalysisResult(stored.analysis || null);
        } else {
          setAnalysisResult(stored);
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
      } else {
        setError('Failed to load story details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!id) return;

    try {
      setIsAnalyzing(true);
      toast.info('Starting comprehensive analysis...');

      const response = await fetch(`http://localhost:8000/api/stories/${id}/analyze`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();

      if (data.success) {
        setHasAnalysis(true);
        setAnalysisResult(data.analysis);
        toast.success('Analysis completed and saved!');

        // Optionally refresh the story data to show updated analysis
        await fetchStoryData();
      }
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Failed to analyze story');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    try {
      const api = getApiClient();
      await api.archiveStory(id);
      toast.success('Story archived successfully');
      window.location.href = '/stories';
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.userMessage);
      } else {
        toast.error('Failed to archive story');
      }
    }
  };

  useEffect(() => {
    fetchStoryData();
  }, [id]);

  const maturityLabels = {
    DEVELOPING: 'Developing Story',
    MATURE: 'Mature Analysis',
    ACTIONABLE: 'Actionable Insight',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-[#ede8d8]" />
        <div className="h-64 w-full bg-[#ede8d8]" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <Alert className="bg-[#8b0000]/10 border-[#8b0000] text-[#8b0000]">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="font-serif">{error || 'Story not found'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <article className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm font-serif">
        <Link to="/stories" className="text-[#00008b] hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Stories
        </Link>
      </div>

      {/* Article Header */}
      <header className="border-b-2 border-[#1a1a1a] pb-6 mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="tag-newspaper bg-[#1a1a1a] text-[#f5f2e9]">
            {maturityLabels[story.maturity]}
          </span>
          {story.current_hypothesis?.sentiment_label && (
            <span className={`tag-newspaper ${story.current_hypothesis.sentiment_label === 'Bullish' ? 'bg-[#006400] text-[#f5f2e9]' :
              story.current_hypothesis.sentiment_label === 'Bearish' ? 'bg-[#8b0000] text-[#f5f2e9]' :
                'bg-[#4a4a4a] text-[#f5f2e9]'
              }`}>
              {story.current_hypothesis.sentiment_label}
            </span>
          )}
        </div>

        <h1 className="headline-main mb-4">{story.main_topic}</h1>

        <div className="byline flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(story.created_at).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span>{story.updates_count} updates tracked</span>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Button
            onClick={hasAnalysis ? () => setIsAnalysisModalOpen(true) : handleAnalyze}
            disabled={isAnalyzing}
            className={`btn-newspaper ${hasAnalysis ? 'bg-[#1a1a1a] text-[#f5f2e9] border-[#1a1a1a]' : 'bg-[#d4af37] text-[#1a1a1a] hover:bg-[#b8941f] border-[#d4af37]'}`}
          >
            <Sparkles className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : hasAnalysis ? 'View Analysis Report' : 'Analyze Story'}
          </Button>
          <Button onClick={fetchStoryData} className="btn-newspaper">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-newspaper border-[#8b0000] text-[#8b0000] hover:bg-[#8b0000] hover:text-[#f5f2e9]">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#f5f2e9] border-2 border-[#1a1a1a]">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Archive Story</DialogTitle>
                <DialogDescription className="font-serif text-[#4a4a4a]">
                  Archive &ldquo;{story.main_topic}&rdquo;?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" className="btn-newspaper">Cancel</Button>
                <Button onClick={handleArchive} className="btn-newspaper bg-[#8b0000] text-[#f5f2e9]">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Story Summary Preview */}
      <div className="bg-[#ede8d8] border-b-2 border-[#1a1a1a] p-6 mb-8">
        <div className="max-w-3xl">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">📋 Executive Summary</p>
            <p className="article-text text-[#1a1a1a]">
              {story.current_hypothesis?.expected_impact ||
                'Analysis in progress. Check the Analysis tab for detailed insights.'}
            </p>
          </div>
          {story.current_hypothesis?.sentiment_score !== undefined && (
            <div className="flex items-center gap-3 pt-4 border-t border-[#1a1a1a]">
              <span className="text-xs uppercase tracking-wider font-serif text-[#6b6b6b]">Conviction</span>
              <div className="flex-1 h-2 border border-[#1a1a1a] max-w-xs">
                <div
                  className="h-full bg-[#1a1a1a]"
                  style={{ width: `${(story.current_hypothesis?.sentiment_score ?? 0.5) * 100}%` }}
                />
              </div>
              <span className="font-serif font-bold text-[#1a1a1a] text-sm">
                {(((story.current_hypothesis?.sentiment_score ?? 0.5) * 100)).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Article Content Tabs */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2 mb-6 border-b border-[#1a1a1a] bg-transparent rounded-none h-auto p-0">
          {[
            { value: 'analysis', label: 'Analysis' },
            { value: 'subreport', label: 'Full Report' },
            { value: 'cognitive', label: 'Cognitive' },
            { value: 'opportunities', label: 'Opportunities' },
            { value: 'market-impact', label: 'Market Impact' },
            { value: 'risk', label: 'Risk' },
            { value: 'exit', label: 'Exit Strategy' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a1a1a] data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-4 font-serif text-sm uppercase tracking-wider"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HypothesisSection hypothesis={story.current_hypothesis} title="Current Hypothesis" />
            <HypothesisSection hypothesis={story.previous_hypothesis} title="Previous Hypothesis" />
          </div>
          <EventsTimeline events={story.events} />
        </TabsContent>

        <TabsContent value="subreport">
          <div className="border border-[#1a1a1a] p-8">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-6">
              Comprehensive Analysis Report
            </h4>
            {subreport?.subreport ? (
              <div className="article-text whitespace-pre-wrap">
                {subreport.subreport}
              </div>
            ) : (
              <p className="text-center font-serif text-[#6b6b6b]">Report not available</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cognitive">
          <div className="border border-[#1a1a1a] p-6">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-6">
              Cognitive Analysis
            </h4>
            {cognitive ? (
              <div className="space-y-6">
                {cognitive.conviction !== undefined && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Conviction Level</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-4 border border-[#1a1a1a]">
                        <div
                          className="h-full bg-[#1a1a1a]"
                          style={{ width: `${cognitive.conviction * 100}%` }}
                        />
                      </div>
                      <span className="font-serif font-bold">{(cognitive.conviction * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}

                {cognitive.contrarian_angle && (
                  <div className="border-t border-[#ede8d8] pt-4">
                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Contrarian Perspective</p>
                    <p className="article-text">{cognitive.contrarian_angle}</p>
                  </div>
                )}

                {cognitive.real_world_opportunities && cognitive.real_world_opportunities.length > 0 && (
                  <div className="border-t border-[#ede8d8] pt-4">
                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-3">Real World Opportunities</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cognitive.real_world_opportunities.map((opp: any, index: number) => (
                        <div key={index} className="border border-[#1a1a1a] p-3">
                          <p className="font-serif font-medium">{opp.description || opp.name}</p>
                          {opp.ticker && <span className="tag-newspaper text-xs mt-2 inline-block">{opp.ticker}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center font-serif text-[#6b6b6b]">Cognitive analysis not available</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="opportunities">
          <div className="border-2 border-[#1a1a1a] overflow-hidden">
            <div className="bg-[#1a1a1a] text-[#f5f2e9] p-3">
              <h4 className="text-center uppercase tracking-wider text-xs sm:text-sm font-serif font-bold">
                ◆ Real-World Actions
              </h4>
            </div>
            <div className="p-4 sm:p-6 bg-[#f5f2e9]">
              {opportunities?.opportunities && opportunities.opportunities.length > 0 ? (
                <div className="space-y-6">
                  {/* Timeline visualization */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#1a1a1a]"></div>
                    <div className="space-y-4">
                      {opportunities.opportunities.map((opp: any, index: number) => {
                        const urgencyColor = opp.timing === 'URGENT' ? '#8b0000' : opp.timing === 'WEEKS' ? '#b8860b' : '#006400';
                        const urgencyLabel = opp.timing === 'URGENT' ? 'Act Now' : opp.timing === 'WEEKS' ? 'This Month' : 'Plan Ahead';

                        return (
                          <div key={index} className="flex gap-4 relative">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold z-10" style={{ backgroundColor: urgencyColor, color: '#f5f2e9' }}>
                              {index + 1}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="border-2 border-[#1a1a1a] p-4 bg-white">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-start gap-2 flex-1">
                                    {opp.type && (
                                      <span className="text-xs font-serif px-2 py-1 bg-[#1a1a1a] text-[#f5f2e9] uppercase shrink-0">
                                        {opp.type.replace('_', ' ')}
                                      </span>
                                    )}
                                    <p className="font-serif font-bold text-[#1a1a1a]">
                                      {opp.item || opp.entity || opp.name || opp.description || 'Opportunity'}
                                    </p>
                                  </div>
                                  {opp.timing && (
                                    <span className="text-xs font-serif px-2 py-1 font-bold uppercase shrink-0" style={{ backgroundColor: urgencyColor, color: '#f5f2e9' }}>
                                      ⏰ {urgencyLabel}
                                    </span>
                                  )}
                                </div>
                                {opp.action && (
                                  <p className="font-serif text-sm text-[#1a1a1a] mb-2 font-medium border-l-4 border-[#1a1a1a] pl-3">
                                    → {opp.action}
                                  </p>
                                )}
                                {opp.reasoning && <p className="article-text text-sm text-[#4a4a4a] mb-3">{opp.reasoning}</p>}
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#ede8d8]">
                                  {opp.investment && (
                                    <span className="text-xs font-serif px-2 py-1 border border-[#1a1a1a] text-[#1a1a1a]">
                                      💰 {opp.investment}
                                    </span>
                                  )}
                                  {opp.expected_savings && (
                                    <span className="text-xs font-serif px-2 py-1 bg-[#006400] text-[#f5f2e9] font-bold">
                                      💵 Save: {opp.expected_savings}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center font-serif text-[#6b6b6b] py-8">No opportunities identified</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="market-impact">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border-2 border-[#006400] overflow-hidden">
              <div className="bg-[#006400] text-[#f5f2e9] p-3">
                <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold flex items-center justify-center gap-2">
                  <span className="text-xl">▲</span> WINNERS
                </h4>
              </div>
              <div className="p-6 bg-[#f5f2e9]">
                {winnersLosers?.winners && winnersLosers.winners.length > 0 ? (
                  <div className="space-y-4">
                    {winnersLosers.winners.map((winner: any, index: number) => (
                      <div key={index} className="border-l-4 border-[#006400] pl-4 py-2">
                        <p className="font-serif font-bold text-[#006400] mb-1">{winner.entity || winner.name || 'Winner'}</p>
                        {winner.reason && <p className="article-text text-sm text-[#4a4a4a] mb-2">{winner.reason}</p>}
                        {winner.relationship && (
                          <p className="text-xs font-serif text-[#6b6b6b] uppercase">
                            Relationship: {winner.relationship.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center font-serif text-[#6b6b6b] py-8">No winners identified</p>
                )}
              </div>
            </div>

            <div className="border-2 border-[#8b0000] overflow-hidden">
              <div className="bg-[#8b0000] text-[#f5f2e9] p-3">
                <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold flex items-center justify-center gap-2">
                  <span className="text-xl">▼</span> LOSERS
                </h4>
              </div>
              <div className="p-6 bg-[#f5f2e9]">
                {winnersLosers?.losers && winnersLosers.losers.length > 0 ? (
                  <div className="space-y-4">
                    {winnersLosers.losers.map((loser: any, index: number) => (
                      <div key={index} className="border-l-4 border-[#8b0000] pl-4 py-2">
                        <p className="font-serif font-bold text-[#8b0000] mb-1">{loser.entity || loser.name || 'Loser'}</p>
                        {loser.reason && <p className="article-text text-sm text-[#4a4a4a] mb-2">{loser.reason}</p>}
                        {loser.relationship && (
                          <p className="text-xs font-serif text-[#6b6b6b] uppercase">
                            Relationship: {loser.relationship.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center font-serif text-[#6b6b6b] py-8">No losers identified</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <div className="border-2 border-[#1a1a1a] overflow-hidden">
            <div className="bg-[#1a1a1a] text-[#f5f2e9] p-3">
              <h4 className="text-center uppercase tracking-wider text-xs sm:text-sm font-serif font-bold">
                Risk Assessment
              </h4>
            </div>
            <div className="p-4 sm:p-6 bg-[#f5f2e9]">
              {risk ? (
                <div className="space-y-6">
                  {risk.overall_risk_score !== undefined && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-3">Overall Risk Score</p>
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-full md:flex-1">
                          <ResponsiveContainer width="100%" height={150}>
                            <RadialBarChart
                              cx="50%"
                              cy="50%"
                              innerRadius="60%"
                              outerRadius="90%"
                              barSize={20}
                              data={[{
                                name: 'Risk',
                                value: risk.overall_risk_score * 10,
                                fill: risk.overall_risk_score > 7 ? '#8b0000' : risk.overall_risk_score > 4 ? '#b8860b' : '#006400'
                              }]}
                              startAngle={180}
                              endAngle={0}
                            >
                              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                              <RadialBar background dataKey="value" cornerRadius={10} />
                              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="font-serif font-bold text-xl md:text-2xl">
                                {risk.overall_risk_score.toFixed(1)}/10
                              </text>
                            </RadialBarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="w-full md:flex-1">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-[#006400]"></div>
                              <span className="text-xs font-serif">Low Risk (0-4)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-[#b8860b]"></div>
                              <span className="text-xs font-serif">Medium Risk (4-7)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-[#8b0000]"></div>
                              <span className="text-xs font-serif">High Risk (7-10)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {risk.scenarios && (
                    <div className="border-t border-[#ede8d8] pt-4">
                      <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-3">Scenario Analysis</p>
                      <div className="w-full overflow-x-auto">
                        <ResponsiveContainer width="100%" height={300} minWidth={300}>
                          <BarChart
                            data={Object.entries(risk.scenarios).map(([scenario, data]: [string, any]) => ({
                              name: scenario.replace('_', ' ').toUpperCase(),
                              return: (data.return * 100).toFixed(1),
                              probability: (data.probability * 100).toFixed(0),
                              fill: data.return >= 0 ? '#006400' : '#8b0000'
                            }))}
                            margin={{ top: 20, right: 10, left: 10, bottom: 40 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#ede8d8" />
                            <XAxis
                              dataKey="name"
                              tick={{ fontSize: 10, fontFamily: 'serif' }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis tick={{ fontSize: 10, fontFamily: 'serif' }} label={{ value: 'Return %', angle: -90, position: 'insideLeft', style: { fontFamily: 'serif', fontSize: 10 } }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#f5f2e9', border: '1px solid #1a1a1a', fontFamily: 'serif', fontSize: '12px' }}
                              formatter={(value: any, name: string) => [
                                name === 'return' ? `${value}%` : `${value}%`,
                                name === 'return' ? 'Expected Return' : 'Probability'
                              ]}
                            />
                            <Bar dataKey="return" fill="#1a1a1a" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                        {Object.entries(risk.scenarios).map(([scenario, data]: [string, any]) => (
                          <div key={scenario} className="border border-[#1a1a1a] p-3">
                            <p className="text-xs font-serif font-bold uppercase mb-1">{scenario.replace('_', ' ')}</p>
                            <p className="text-sm">Return: <span className={data.return >= 0 ? 'text-[#006400] font-bold' : 'text-[#8b0000] font-bold'}>{(data.return * 100).toFixed(1)}%</span></p>
                            <p className="text-sm text-[#6b6b6b]">Probability: {(data.probability * 100).toFixed(0)}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {risk.stop_loss && (
                    <div className="border-t border-[#ede8d8] pt-4">
                      <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Stop Loss</p>
                      <div className="border border-[#8b0000] p-3">
                        <p className="font-serif"><span className="font-bold">{(risk.stop_loss.stop_loss_pct * 100).toFixed(1)}%</span> - {risk.stop_loss.type}</p>
                        {risk.stop_loss.reasoning && <p className="text-sm text-[#6b6b6b] mt-1">{risk.stop_loss.reasoning}</p>}
                      </div>
                    </div>
                  )}

                  {risk.expected_value !== undefined && (
                    <div className="border-t border-[#ede8d8] pt-4">
                      <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Expected Value</p>
                      <p className="text-lg font-serif font-bold">{(risk.expected_value * 100).toFixed(2)}%</p>
                    </div>
                  )}

                  {risk.risk_reward_ratio !== undefined && (
                    <div className="border-t border-[#ede8d8] pt-4">
                      <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Risk/Reward Ratio</p>
                      <p className="text-lg font-serif font-bold">{risk.risk_reward_ratio.toFixed(2)}:1</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center font-serif text-[#6b6b6b] py-8">Risk assessment not available</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="exit">
          <div className="border-2 border-[#1a1a1a] overflow-hidden">
            <div className="bg-[#1a1a1a] text-[#f5f2e9] p-3">
              <h4 className="text-center uppercase tracking-wider text-xs sm:text-sm font-serif font-bold">
                Exit Strategy
              </h4>
            </div>
            <div className="p-4 sm:p-6 bg-[#f5f2e9]">
              {exitStrategy ? (
                <div className="space-y-6">
                  {exitStrategy.strategy_type && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-2">Strategy Type</p>
                      <p className="font-serif font-bold">{exitStrategy.strategy_type} - {exitStrategy.conviction_level} Conviction</p>
                    </div>
                  )}

                  {exitStrategy.exits && exitStrategy.exits.length > 0 && (
                    <div className="border-t border-[#ede8d8] pt-4">
                      <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-3">Exit Levels</p>
                      <div className="space-y-2">
                        {exitStrategy.exits.map((exit: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-[#006400]">
                            <div>
                              <p className="font-serif font-medium">Exit #{exit.exit_number}</p>
                              <p className="text-sm text-[#6b6b6b]">{exit.trigger_type.replace('_', ' ')}</p>
                            </div>
                            <div className="text-right">
                              {exit.trigger_price && <p className="font-serif font-bold">${exit.trigger_price.toFixed(2)}</p>}
                              {exit.trail_percent && <p className="text-sm text-[#6b6b6b]">Trail: {(exit.trail_percent * 100).toFixed(0)}%</p>}
                              <p className="text-sm">Size: {(exit.position_size * 100).toFixed(0)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {exitStrategy.stop_loss && (
                    <div className="border-t border-[#ede8d8] pt-4">
                      <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-3">Stop Loss</p>
                      <div className="border border-[#8b0000] p-3">
                        <p className="font-serif font-bold">${exitStrategy.stop_loss.price.toFixed(2)}</p>
                        <p className="text-sm text-[#6b6b6b]">{exitStrategy.stop_loss.type}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center font-serif text-[#6b6b6b]">Exit strategy not available</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#f5f2e9] border-2 border-[#1a1a1a]">
          <DialogHeader className="border-b border-[#1a1a1a] pb-4">
            <DialogTitle className="font-serif text-2xl text-[#1a1a1a]">{story.main_topic}</DialogTitle>
            <DialogDescription className="font-serif text-[#6b6b6b]">Generated analysis</DialogDescription>
          </DialogHeader>
          {analysisResult && <AnalysisReport analysis={analysisResult} compact={false} />}
        </DialogContent>
      </Dialog>
    </article>
  );
}
