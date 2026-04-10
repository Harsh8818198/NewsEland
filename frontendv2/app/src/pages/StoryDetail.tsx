import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Layout, 
  FileText, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Sparkles,
  Archive,
  BarChart3,
  Calendar,
  Share2,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
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

      if (subreportData.status === 'fulfilled') setSubreport(subreportData.value);
      if (cognitiveData.status === 'fulfilled') setCognitive(cognitiveData.value);
      if (opportunitiesData.status === 'fulfilled') setOpportunities(opportunitiesData.value);
      if (winnersLosersData.status === 'fulfilled') setWinnersLosers(winnersLosersData.value);
      if (riskData.status === 'fulfilled') setRisk(riskData.value);
      if (exitData.status === 'fulfilled') setExitStrategy(exitData.value);

      if (analysisData.status === 'fulfilled' && analysisData.value.exists) {
        setHasAnalysis(true);
        const stored = analysisData.value.analysis;
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
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      if (data.success) {
        setHasAnalysis(true);
        setAnalysisResult(data.analysis);
        toast.success('Analysis completed!');
        await fetchStoryData();
      }
    } catch (err) {
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
      toast.error('Failed to archive story');
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

  if (loading) return <div className="p-8 text-center font-serif">Decrypting Archive...</div>;

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
      <div className="flex items-center gap-2 mb-6 text-sm font-serif">
        <Link to="/stories" className="text-[#00008b] hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Stories
        </Link>
      </div>

      <header className="border-b-2 border-[#1a1a1a] pb-6 mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="tag-newspaper bg-[#1a1a1a] text-[#f5f2e9]">
            {maturityLabels[story.maturity]}
          </span>
        </div>
        <h1 className="headline-main mb-4">{story.main_topic}</h1>
        <div className="byline flex flex-wrap items-center gap-4">
           <span>{story.updates_count} updates tracked</span>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Button onClick={hasAnalysis ? () => setIsAnalysisModalOpen(true) : handleAnalyze} disabled={isAnalyzing} className="btn-newspaper">
            <Sparkles className="h-4 w-4 mr-2" />
            {hasAnalysis ? 'View Analysis' : 'Analyze'}
          </Button>
          <Button onClick={fetchStoryData} className="btn-newspaper">Refresh</Button>
        </div>
      </header>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6 border-b border-[#1a1a1a] bg-transparent rounded-none h-auto p-0">
          <TabsTrigger value="analysis" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a1a1a] py-3 uppercase tracking-wider">Analysis</TabsTrigger>
          <TabsTrigger value="subreport" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a1a1a] py-3 uppercase tracking-wider">Full Report</TabsTrigger>
          <TabsTrigger value="cognitive" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a1a1a] py-3 uppercase tracking-wider">Cognitive</TabsTrigger>
          <TabsTrigger value="opportunities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a1a1a] py-3 uppercase tracking-wider">Opportunities</TabsTrigger>
          <TabsTrigger value="market-impact" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a1a1a] py-3 uppercase tracking-wider">Market Impact</TabsTrigger>
          <TabsTrigger value="risk" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a1a1a] py-3 uppercase tracking-wider">Risk</TabsTrigger>
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
            <div className="article-text whitespace-pre-wrap">{subreport?.subreport || 'Report not available'}</div>
          </div>
        </TabsContent>

        <TabsContent value="cognitive">
          <div className="border-4 border-double border-[#1a1a1a] p-4 sm:p-8 bg-[#fdfaf3] shadow-inner relative overflow-y-auto max-h-[800px] custom-scrollbar">
            {/* Dossier Watermark - Now Fixed position relative to container */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none fixed">
               <h1 className="text-9xl font-serif font-black rotate-[-45deg] whitespace-nowrap">CLASSIFIED ARCHIVE</h1>
            </div>

            <div className="relative z-10 scroll-m-4">
              <div className="flex justify-between items-center border-b-2 border-[#1a1a1a] pb-4 mb-8">
                <div>
                  <h4 className="headline-main text-2xl mb-1">Intelligence Dossier</h4>
                  <p className="font-serif text-xs uppercase tracking-[0.2em] text-[#6b6b6b]">Subject: {story.main_topic} // Ref: {story.id}</p>
                </div>
                <div className="text-right">
                  <span className="tag-newspaper bg-[#8b0000] text-[#f5f2e9] px-4 py-1 animate-pulse">EYES ONLY</span>
                  <p className="font-serif text-[10px] mt-1 text-[#6b6b6b]">{new Date().toISOString().split('T')[0]}</p>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <RefreshCw className="animate-spin h-10 w-10 text-[#1a1a1a] mb-4" />
                  <p className="font-serif italic text-sm">Decrypting Cognitive Layers...</p>
                </div>
              ) : cognitive?.airlms_result ? (
                <div className="space-y-0">
                  {[
                    { id: 'perception', layer: 'I. PERCEPTION', content: cognitive.airlms_result.layer_1_perception, subtitle: 'Raw Signal Capture', color: '#1a1a1a' },
                    { id: 'context', layer: 'II. CONTEXTUALIZATION', content: cognitive.airlms_result.layer_2_contextualization, subtitle: 'Environmental Mapping', color: '#4a4a4a' },
                    { id: 'analysis', layer: 'III. DIALECTICAL ANALYSIS', content: cognitive.airlms_result.layer_3_analysis, subtitle: 'Synthesis of Conflicts', color: '#1a1a1a' },
                    { id: 'synthesis', layer: 'IV. PREDICTIVE SYNTHESIS', content: cognitive.airlms_result.layer_4_synthesis, subtitle: 'Emergent Outcomes', color: '#4a4a4a' }
                  ].map((layer, idx) => (
                    <div key={layer.id} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8 py-8 border-b border-dashed border-[#1a1a1a]/30 last:border-0 hover:bg-[#1a1a1a]/[0.02] transition-colors duration-500 group">
                      <div className="border-r border-[#1a1a1a]/20 pr-4">
                        <h5 className="font-serif font-black text-xs tracking-widest text-[#1a1a1a] mb-1">{layer.layer}</h5>
                        <p className="font-serif text-[10px] italic text-[#6b6b6b] uppercase">{layer.subtitle}</p>
                        <div className="mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="w-8 h-[1px] bg-[#d4af37]"></div>
                           <div className="w-1 h-1 rounded-full bg-[#d4af37]"></div>
                        </div>
                      </div>
                      <div className="article-text text-sm leading-relaxed text-justify">
                        {layer.content}
                      </div>
                    </div>
                  ))}

                  {/* LAYER 5: STRATEGIC RECOMMENDATION (The Crown Jewel) */}
                  <div className="mt-12 bg-[#1a1a1a] text-[#f5f2e9] p-8 relative shadow-2xl">
                     <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Sparkles className="h-20 w-20 text-[#d4af37]" />
                     </div>
                     <div className="mb-6 pb-4 border-b border-[#f5f2e9]/30">
                        <h5 className="font-serif font-black text-xl italic tracking-tighter text-[#d4af37]">V. Strategic Recommendation</h5>
                        <p className="font-serif text-[10px] uppercase tracking-[0.3em] opacity-60">Final Resolution & Action Protocol</p>
                     </div>
                     <p className="article-text text-lg leading-relaxed text-[#f5f2e9] first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 font-medium">
                        {cognitive.airlms_result.layer_5_recommendation}
                     </p>
                     
                     <div className="mt-8 pt-6 border-t border-[#f5f2e9]/30 flex justify-between items-end">
                        <div className="space-y-1">
                           <p className="font-serif text-[10px] uppercase opacity-50">Authorized by</p>
                           <p className="text-2xl font-display italic text-[#d4af37]">Archival Intelligence v5.0</p>
                        </div>
                        <div className="text-right">
                           <p className="font-serif text-[10px] uppercase opacity-50 mb-1">Conviction</p>
                           <div className="flex items-center gap-3">
                              <span className="text-4xl font-serif font-black tracking-tighter">{(cognitive.conviction * 100 || 85).toFixed(0)}%</span>
                              <div className="w-12 h-12 rounded-full border-2 border-[#d4af37] flex items-center justify-center p-1">
                                 <div className="w-full h-full rounded-full bg-[#d4af37]/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 px-8 border-2 border-dashed border-[#1a1a1a]/30">
                  <div className="mb-6 opacity-40">
                    <Archive className="h-16 w-16 mx-auto mb-4" />
                    <h5 className="headline-main text-xl">Dossier Incomplete</h5>
                  </div>
                  <p className="font-serif italic text-[#6b6b6b] mb-8 max-w-md mx-auto">This legacy record lacks the 5-layer cognitive depth. Initialize the archival reasoning process to generate the dossier.</p>
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing} 
                    className="btn-newspaper bg-[#1a1a1a] text-[#f5f2e9] hover:bg-[#d4af37] hover:text-[#1a1a1a] transition-all duration-500 scale-110"
                  >
                    <Sparkles className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Synthesizing Layers...' : 'Initialize AIRLMS Reasoning'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="opportunities">
           <div className="border border-[#1a1a1a] p-6">
              {opportunities?.opportunities?.length > 0 ? (
                <div className="space-y-4">
                  {opportunities.opportunities.map((opp: any, i: number) => (
                    <div key={i} className="border-l-4 border-black pl-4">
                      <p className="font-bold">{opp.item || opp.name}</p>
                      <p className="text-sm">{opp.reasoning}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center italic">No opportunities found</p>}
           </div>
        </TabsContent>

        <TabsContent value="market-impact">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="border-2 border-[#006400] p-6 bg-[#f0f9f0]">
                <h4 className="font-serif font-black text-[#006400] uppercase tracking-tighter text-xl mb-6 border-b border-[#006400]/30 pb-2">Growth Archetypes (Winners)</h4>
                <div className="space-y-6">
                   {winnersLosers?.winners?.map((w: any, i: number) => (
                      <div key={i} className="group">
                         <div className="flex justify-between items-start mb-1">
                            <p className="font-serif font-bold text-lg">{w.entity}</p>
                            <span className="text-[10px] bg-[#006400] text-white px-2 py-0.5">LONG BIAS</span>
                         </div>
                         <p className="article-text text-sm italic opacity-80">{w.reason}</p>
                         <div className="mt-2 h-1 w-0 group-hover:w-full bg-[#006400] transition-all duration-500"></div>
                      </div>
                   ))}
                </div>
             </div>
             
             <div className="border-2 border-[#8b0000] p-6 bg-[#f9f0f0]">
                <h4 className="font-serif font-black text-[#8b0000] uppercase tracking-tighter text-xl mb-6 border-b border-[#8b0000]/30 pb-2">Destabilization Risks (Losers)</h4>
                <div className="space-y-6">
                   {winnersLosers?.losers?.map((l: any, i: number) => (
                      <div key={i} className="group">
                         <div className="flex justify-between items-start mb-1">
                            <p className="font-serif font-bold text-lg">{l.entity}</p>
                            <span className="text-[10px] bg-[#8b0000] text-white px-2 py-0.5">SHORT BIAS</span>
                         </div>
                         <p className="article-text text-sm italic opacity-80">{l.reason}</p>
                         <div className="mt-2 h-1 w-0 group-hover:w-full bg-[#8b0000] transition-all duration-500"></div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </TabsContent>

        <TabsContent value="risk">
           <div className="space-y-8 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
              {/* Scenario Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {risk?.scenarios && Object.entries(risk.scenarios).map(([key, scenario]: [string, any]) => (
                    <div key={key} className={`p-4 border-2 ${key === 'black_swan' ? 'bg-[#1a1a1a] text-white border-red-600' : 'bg-white border-[#1a1a1a]'}`}>
                       <h5 className="font-serif font-black text-xs uppercase mb-2 tracking-widest opacity-60">
                          {key.replace('_', ' ')}
                       </h5>
                       <div className="flex items-end gap-2 mb-4">
                          <span className="text-3xl font-serif font-bold tracking-tighter">{(scenario.probability * 100).toFixed(0)}%</span>
                          <span className="text-xs mb-1 opacity-60">PROB</span>
                       </div>
                       <p className="article-text text-xs leading-relaxed italic">{scenario.narrative || 'Tactical projections pending agent verification...'}</p>
                       <div className="mt-4 pt-4 border-t border-current opacity-20 flex justify-between items-center">
                          <span className="text-[10px]">Proj. Return</span>
                          <span className={`font-bold ${scenario.return >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                             {scenario.return > 0 ? '+' : ''}{(scenario.return * 100).toFixed(0)}%
                          </span>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Exit Strategy & Invalidation Signals */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                 <div className="border-2 border-double border-[#1a1a1a] p-8 bg-[#fdfaf3]">
                    <h4 className="headline-main text-xl mb-6 underline decoration-[#d4af37] underline-offset-8 text-center uppercase">Automated Exit Protocol</h4>
                    {exitStrategy ? (
                       <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {exitStrategy.targets?.map((target: any, i: number) => (
                                <div key={i} className="relative p-6 border-l-4 border-[#d4af37] bg-white shadow-sm">
                                   <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#d4af37] text-[#1a1a1a] flex items-center justify-center font-black text-xs">
                                      {i + 1}
                                   </div>
                                   <p className="text-xs font-serif uppercase tracking-widest mb-1 opacity-50">Profit Target</p>
                                   <p className="text-2xl font-serif font-black">+{ (target.target_pct * 100).toFixed(0) }%</p>
                                   <p className="article-text text-xs mt-3 italic opacity-80">{target.logic}</p>
                                   <p className="text-[10px] mt-2 font-bold uppercase tracking-tighter">POSITION SIZE: {(target.position_to_close * 100).toFixed(0)}%</p>
                                </div>
                             ))}
                             <div className="p-6 border-l-4 border-red-600 bg-red-50 shadow-sm opacity-90">
                                <p className="text-xs font-serif uppercase tracking-widest mb-1 text-red-800">Stop-Loss (Hard)</p>
                                <p className="text-2xl font-serif font-black text-red-600">{ (exitStrategy.stop_loss_pct * 100).toFixed(0) }%</p>
                                <p className="article-text text-xs mt-3 italic text-red-800">Automated liquidation protocol active.</p>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <p className="article-text italic text-center py-10 opacity-60">Protocols generate upon AIRLMS reasoning initialization.</p>
                    )}
                 </div>

                 <div className="space-y-4">
                    <div className="bg-[#8b0000] text-white p-6 shadow-xl">
                       <h5 className="font-serif font-black text-xs uppercase tracking-[0.2em] mb-4 border-b border-white/20 pb-2">Thesis Invalidation Signals</h5>
                       <ul className="space-y-4">
                          {exitStrategy?.invalidation_signals?.map((signal: string, i: number) => (
                             <li key={i} className="flex gap-3 items-start">
                                <div className="mt-1 w-2 h-2 rounded-full bg-white shrink-0 animate-pulse"></div>
                                <p className="font-serif italic text-xs leading-relaxed opacity-90">{signal}</p>
                             </li>
                          )) || <p className="text-[10px] opacity-60 italic text-center">Awaiting tactical data...</p>}
                       </ul>
                    </div>
                    <div className="border border-[#1a1a1a] p-4 text-center">
                       <p className="text-[10px] font-serif uppercase tracking-widest mb-1">Audit Trail</p>
                       <p className="text-xs font-serif italic text-[#6b6b6b]">Protocol Status: AGENT VERIFIED</p>
                    </div>
                 </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-[#f5f2e9] border-2 border-[#1a1a1a] p-0 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1 p-8" style={{ WebkitOverflowScrolling: 'touch' }}>
            {analysisResult && <AnalysisReport analysis={analysisResult} compact={false} />}
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
