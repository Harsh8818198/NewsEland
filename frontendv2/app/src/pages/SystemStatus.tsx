import { useState, useEffect } from 'react';
import { RefreshCw, Play, Square, Settings, AlertCircle, CheckCircle2, XCircle, Trash2, Cpu, Database, BrainCircuit, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getApiClient, ApiError } from '@/services/api';
import type { SystemStatusResponse, ScraperStatusResponse, ScraperStatsResponse } from '@/services/api';
import { toast } from 'sonner';

function BrainStatus({ name, status, icon: Icon }: { name: string; status: string; icon: React.ElementType }) {
  const isActive = status === 'active' || status === 'healthy' || status === 'running';
  
  return (
    <div className="flex items-center justify-between p-3 border border-[#1a1a1a]">
      <div className="flex items-center gap-3">
        <Icon className={`h-4 w-4 ${isActive ? 'text-[#006400]' : 'text-[#8b0000]'}`} />
        <span className="text-sm font-serif capitalize">{name}</span>
      </div>
      <span className={`tag-newspaper text-xs ${isActive ? 'bg-[#006400] text-[#f5f2e9]' : 'bg-[#8b0000] text-[#f5f2e9]'}`}>
        {status}
      </span>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#1a1a1a] p-3 text-center">
      <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif">{label}</p>
      <p className="text-xl font-bold font-serif">{value}</p>
    </div>
  );
}

export function SystemStatus() {
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [scraperStatus, setScraperStatus] = useState<ScraperStatusResponse | null>(null);
  const [scraperStats, setScraperStats] = useState<ScraperStatsResponse | null>(null);
  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);
  
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [runtimeHours, setRuntimeHours] = useState(24);
  const [autoStart, setAutoStart] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();
      
      const [statusData, scraperData, statsData] = await Promise.allSettled([
        api.getSystemStatus(),
        api.getScraperStatus(),
        api.getScraperStats(),
      ]);

      if (statusData.status === 'fulfilled') setSystemStatus(statusData.value);
      if (scraperData.status === 'fulfilled') {
        setScraperStatus(scraperData.value);
        if (scraperData.value.config) {
          setIntervalMinutes(scraperData.value.config.interval_minutes || 30);
          setRuntimeHours(scraperData.value.config.runtime_hours || 24);
          setAutoStart(scraperData.value.config.auto_start || false);
        }
      }
      if (statsData.status === 'fulfilled') setScraperStats(statsData.value);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
      } else {
        setError('Failed to load system status');
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
      await fetchData();
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

  const handleReset = async () => {
    try {
      setResetting(true);
      const api = getApiClient();
      await api.resetSystem();
      toast.success('System reset successfully');
      await fetchData();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.userMessage);
      } else {
        toast.error('Failed to reset system');
      }
    } finally {
      setResetting(false);
    }
  };

  const handleStartScraper = async () => {
    try {
      const api = getApiClient();
      await api.startScraper();
      toast.success('Scraper started');
      await fetchData();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.userMessage);
      } else {
        toast.error('Failed to start scraper');
      }
    }
  };

  const handleStopScraper = async () => {
    try {
      const api = getApiClient();
      await api.stopScraper();
      toast.success('Scraper stopped');
      await fetchData();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.userMessage);
      } else {
        toast.error('Failed to stop scraper');
      }
    }
  };

  const handleUpdateConfig = async () => {
    try {
      const api = getApiClient();
      await api.updateScraperConfig({
        interval_minutes: intervalMinutes,
        runtime_hours: runtimeHours,
        auto_start: autoStart,
      });
      toast.success('Configuration updated');
      await fetchData();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.userMessage);
      } else {
        toast.error('Failed to update configuration');
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b-2 border-[#1a1a1a] pb-4">
        <h1 className="headline-main text-center">The Operations Room</h1>
        <p className="text-center font-serif text-[#6b6b6b] mt-2">
          System status and operational controls
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-[#8b0000]/10 border-[#8b0000] text-[#8b0000]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="System Status" value={systemStatus?.status || 'Unknown'} />
        <StatBox label="Stories Tracked" value={(systemStatus?.stories_tracked || 0).toString()} />
        <StatBox label="Scraper" value={scraperStatus?.is_running ? 'Running' : 'Stopped'} />
        <StatBox label="Articles" value={(scraperStats?.total_articles || 0).toString()} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brain Status */}
        <div className="border-2 border-[#1a1a1a] p-6">
          <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
            AI Brain Status
          </h4>
          {systemStatus ? (
            <div className="space-y-2">
              <BrainStatus name="Ingestion" status={systemStatus.brains.ingestion} icon={Database} />
              <BrainStatus name="Analysis" status={systemStatus.brains.analysis} icon={BrainCircuit} />
              <BrainStatus name="Memory" status={systemStatus.brains.memory} icon={Cpu} />
              <BrainStatus name="Portfolio" status={systemStatus.brains.portfolio} icon={TrendingUp} />
              <BrainStatus name="Intelligence" status={systemStatus.brains.intelligence} icon={Zap} />
            </div>
          ) : (
            <p className="text-center font-serif text-[#6b6b6b]">No status available</p>
          )}
        </div>

        {/* Scraper Controls */}
        <div className="border-2 border-[#1a1a1a] p-6">
          <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
            News Scraper Controls
          </h4>
          
          {/* Status */}
          <div className="flex items-center justify-between p-3 border border-[#1a1a1a] mb-4">
            <div className="flex items-center gap-3">
              {scraperStatus?.is_running ? (
                <CheckCircle2 className="h-5 w-5 text-[#006400]" />
              ) : (
                <XCircle className="h-5 w-5 text-[#8b0000]" />
              )}
              <span className="font-serif">Status</span>
            </div>
            <div className="flex items-center gap-2">
              {scraperStatus?.is_running ? (
                <Button onClick={handleStopScraper} className="btn-newspaper border-[#8b0000] text-[#8b0000]">
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              ) : (
                <Button onClick={handleStartScraper} className="btn-newspaper bg-[#006400] text-[#f5f2e9] border-[#006400]">
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4 border-t border-[#ede8d8] pt-4">
            <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif">Configuration</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-serif text-[#6b6b6b]">Interval (min)</Label>
                <Input
                  type="number"
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 30)}
                  className="newspaper-input mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-serif text-[#6b6b6b]">Runtime (hrs)</Label>
                <Input
                  type="number"
                  value={runtimeHours}
                  onChange={(e) => setRuntimeHours(parseInt(e.target.value) || 24)}
                  className="newspaper-input mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-serif">Auto-start</Label>
              <Switch checked={autoStart} onCheckedChange={setAutoStart} />
            </div>

            <Button onClick={handleUpdateConfig} className="w-full btn-newspaper">
              <Settings className="h-4 w-4 mr-2" />
              Update Config
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-2 border-[#1a1a1a] p-6">
        <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
          Administrative Actions
        </h4>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-newspaper bg-[#1a1a1a] text-[#f5f2e9]"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh News
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-newspaper border-[#8b0000] text-[#8b0000]">
                <Trash2 className="h-4 w-4 mr-2" />
                Reset System
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#f5f2e9] border-2 border-[#8b0000]">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-[#8b0000]">Reset System Memory</DialogTitle>
                <DialogDescription className="font-serif text-[#4a4a4a]">
                  This will permanently delete all stories and analysis data. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" className="btn-newspaper">Cancel</Button>
                <Button 
                  onClick={handleReset}
                  disabled={resetting}
                  className="btn-newspaper bg-[#8b0000] text-[#f5f2e9]"
                >
                  {resetting ? 'Resetting...' : 'Confirm Reset'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
