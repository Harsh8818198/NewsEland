import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Archive, RefreshCw, Search, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getApiClient, ApiError } from '@/services/api';
import type { BackendStory, AnalysisResponse } from '@/services/api';
import AnalysisReport from '@/components/AnalysisReport';
import { toast } from 'sonner';

type MaturityFilter = 'ALL' | 'DEVELOPING' | 'MATURE' | 'ACTIONABLE';
type SentimentFilter = 'ALL' | 'Bullish' | 'Bearish' | 'Neutral';

function StoryArticle({ story, onArchive }: { story: BackendStory; onArchive?: (id: string) => void }) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const sentimentConfig = {
    Bullish: { icon: TrendingUp, color: 'text-[#006400]', label: 'Bullish' },
    Bearish: { icon: TrendingDown, color: 'text-[#8b0000]', label: 'Bearish' },
    Neutral: { icon: Minus, color: 'text-[#4a4a4a]', label: 'Neutral' },
  };

  const maturityLabels = {
    DEVELOPING: 'Developing',
    MATURE: 'Mature',
    ACTIONABLE: 'Actionable',
  };

  const handleViewAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      const api = getApiClient();
      const response = await api.getAnalysis(story.id);

      if (response.success && response.exists && response.analysis) {
        const stored = response.analysis;
        const analysisObj = stored && (stored.analysis || stored.analysis === null) ? stored.analysis || null : stored;
        setAnalysis(analysisObj);
        setIsAnalysisOpen(true);
      } else {
        toast.error('No analysis available for this story');
      }
    } catch (err) {
      console.error('Failed to load analysis:', err);
      toast.error('Failed to load analysis');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const sentimentKey = (story.current_hypothesis?.sentiment_label as keyof typeof sentimentConfig) ?? 'Neutral';
  const sentiment = sentimentConfig[sentimentKey] || sentimentConfig.Neutral;
  const SentimentIcon = sentiment?.icon ?? Minus;

  return (
    <article className="border-b border-[#1a1a1a] pb-6 mb-6">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="tag-newspaper border-[#1a1a1a]">
          {maturityLabels[story.maturity]}
        </span>
        <span className={`flex items-center gap-1 text-sm font-serif ${sentiment.color}`}>
          <SentimentIcon className="h-4 w-4" />
          {sentiment.label}
        </span>
        <span className="text-sm text-[#6b6b6b] font-serif">
          {new Date(story.created_at).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>

      <Link to={`/stories/${story.id}`}>
        <h3 className="headline-secondary mb-3 hover:underline">
          {story.main_topic}
        </h3>
      </Link>

      <p className="article-text text-[#4a4a4a] mb-4">
        {story.current_hypothesis?.expected_impact ||
          'Our AI analysis team is monitoring developments in this area. Initial signals suggest potential market impact requiring further investigation.'}
      </p>

      <div className="mb-4 p-4 bg-[#ede8d8] border border-[#1a1a1a] text-sm">
        <p className="font-serif font-bold text-[#1a1a1a] mb-2">📊 What's Inside:</p>
        <ul className="text-xs text-[#4a4a4a] space-y-1 font-serif">
          <li>✓ Current & Previous Hypothesis</li>
          <li>✓ Chronicle of {story.events.length} Key Events</li>
          <li>✓ Comprehensive Analysis Report</li>
          <li>✓ Market Winners & Losers</li>
          <li>✓ Real-World Investment Actions</li>
          <li>✓ Risk Assessment & Exit Strategy</li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm font-serif">
        <span className="text-[#4a4a4a]">{story.updates_count} updates</span>
        <span className="text-[#6b6b6b]">|</span>
        <button
          onClick={handleViewAnalysis}
          disabled={loadingAnalysis}
          className="text-[#00008b] hover:underline disabled:text-[#6b6b6b] disabled:cursor-not-allowed"
        >
          {loadingAnalysis ? 'Loading Analysis...' : 'View Analysis'}
        </button>
        <span className="text-[#6b6b6b]">|</span>
        <Link to={`/stories/${story.id}`} className="text-[#00008b] hover:underline">
          Full Details &rarr;
        </Link>

        {onArchive && story.status === 'ACTIVE' && (
          <>
            <span className="text-[#6b6b6b]">|</span>
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-[#8b0000] hover:underline flex items-center gap-1">
                  <Archive className="h-3 w-3" />
                  Archive
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#f5f2e9] border-2 border-[#1a1a1a]">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Archive Story</DialogTitle>
                  <DialogDescription className="font-serif text-[#4a4a4a]">
                    Move &ldquo;{story.main_topic}&rdquo; to the archives? This story will no longer appear in active listings.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" className="btn-newspaper">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => onArchive(story.id)}
                    className="btn-newspaper bg-[#8b0000] text-[#f5f2e9] border-[#8b0000]"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      {/* Analysis Report Modal */}
      <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#f5f2e9] border-2 border-[#1a1a1a]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#1a1a1a]">Analysis Report</DialogTitle>
            <DialogDescription className="font-serif text-[#4a4a4a]">
              {story.main_topic}
            </DialogDescription>
          </DialogHeader>
          {analysis && <AnalysisReport analysis={analysis} compact={true} />}
        </DialogContent>
      </Dialog>
    </article>
  );
}

export function Stories() {
  const [activeStories, setActiveStories] = useState<BackendStory[]>([]);
  const [archivedStories, setArchivedStories] = useState<BackendStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [maturityFilter, setMaturityFilter] = useState<MaturityFilter>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();

      const [activeData, archivedData] = await Promise.all([
        api.getStories(),
        api.getArchivedStories(),
      ]);

      setActiveStories(activeData.stories);
      setArchivedStories(archivedData.stories);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
      } else {
        setError('Failed to load stories');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const api = getApiClient();
      const result = await api.refreshStories();
      toast.success(`Found ${result.articles_found} articles, created ${result.new_stories} new stories`);
      await fetchStories();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.userMessage);
      } else {
        toast.error('Failed to refresh stories');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleArchive = async (storyId: string) => {
    try {
      const api = getApiClient();
      await api.archiveStory(storyId);
      toast.success('Story archived successfully');
      await fetchStories();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.userMessage);
      } else {
        toast.error('Failed to archive story');
      }
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const filterStories = (stories: BackendStory[]) => {
    return stories.filter((story) => {
      const matchesSearch = story.main_topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMaturity = maturityFilter === 'ALL' || story.maturity === maturityFilter;
      const matchesSentiment = sentimentFilter === 'ALL' || story.current_hypothesis?.sentiment_label === sentimentFilter;
      return matchesSearch && matchesMaturity && matchesSentiment;
    });
  };

  const filteredActive = filterStories(activeStories);
  const filteredArchived = filterStories(archivedStories);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b-2 border-[#1a1a1a] pb-4">
        <h1 className="headline-main text-center">Market Stories</h1>
        <p className="text-center font-serif text-[#6b6b6b] mt-2">
          Comprehensive coverage of investment narratives and market intelligence
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-[#8b0000]/10 border-[#8b0000] text-[#8b0000]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="border border-[#1a1a1a] p-4 bg-[#ede8d8]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
            <Input
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 newspaper-input"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={maturityFilter}
              onChange={(e) => setMaturityFilter(e.target.value as MaturityFilter)}
              className="newspaper-input text-sm"
            >
              <option value="ALL">All Maturity</option>
              <option value="DEVELOPING">Developing</option>
              <option value="MATURE">Mature</option>
              <option value="ACTIONABLE">Actionable</option>
            </select>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value as SentimentFilter)}
              className="newspaper-input text-sm"
            >
              <option value="ALL">All Sentiment</option>
              <option value="Bullish">Bullish</option>
              <option value="Bearish">Bearish</option>
              <option value="Neutral">Neutral</option>
            </select>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-newspaper"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stories Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="w-full border-b border-[#1a1a1a] bg-transparent rounded-none h-auto p-0">
          <TabsTrigger
            value="active"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a1a1a] data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 font-serif uppercase tracking-wider"
          >
            Active Stories ({filteredActive.length})
          </TabsTrigger>
          <TabsTrigger
            value="archived"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a1a1a] data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 font-serif uppercase tracking-wider"
          >
            Archives ({filteredArchived.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-0 mt-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-[#1a1a1a] pb-6 mb-6">
                  <div className="h-6 w-24 bg-[#ede8d8] mb-3" />
                  <div className="h-8 w-3/4 bg-[#ede8d8] mb-3" />
                  <div className="h-20 w-full bg-[#ede8d8]" />
                </div>
              ))}
            </div>
          ) : filteredActive.length > 0 ? (
            <div className="columns-1 md:columns-2 gap-x-8">
              {filteredActive.map((story) => (
                <StoryArticle key={story.id} story={story} onArchive={handleArchive} />
              ))}
            </div>
          ) : (
            <Card className="border-2 border-[#1a1a1a] bg-[#ede8d8]">
              <CardContent className="p-8 text-center">
                <h3 className="headline-tertiary mb-2">No Stories Found</h3>
                <p className="font-serif text-[#4a4a4a]">
                  {searchQuery || maturityFilter !== 'ALL' || sentimentFilter !== 'ALL'
                    ? 'Try adjusting your search criteria'
                    : 'Refresh news to discover new market stories'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-0 mt-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-[#1a1a1a] pb-6 mb-6">
                  <div className="h-6 w-24 bg-[#ede8d8] mb-3" />
                  <div className="h-8 w-3/4 bg-[#ede8d8] mb-3" />
                  <div className="h-20 w-full bg-[#ede8d8]" />
                </div>
              ))}
            </div>
          ) : filteredArchived.length > 0 ? (
            <div className="columns-1 md:columns-2 gap-x-8">
              {filteredArchived.map((story) => (
                <StoryArticle key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <Card className="border-2 border-[#1a1a1a] bg-[#ede8d8]">
              <CardContent className="p-8 text-center">
                <h3 className="headline-tertiary mb-2">No Archived Stories</h3>
                <p className="font-serif text-[#4a4a4a]">
                  Stories you archive will appear in this section
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
