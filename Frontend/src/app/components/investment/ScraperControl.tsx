'use client';

import { useState, useEffect } from 'react';
import { getApiClient } from '@/app/services/api';
import { ScraperStatus } from '@/app/types/investment';
import { Play, Square, Settings, Activity, Clock, AlertCircle } from 'lucide-react';

export function ScraperControl() {
    const api = getApiClient();
    const [status, setStatus] = useState<ScraperStatus | null>(null);
    const [config, setConfig] = useState({
        interval_minutes: 30,
        runtime_hours: 0
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const data = await api.getScraperStatus();
            setStatus(data);
            setConfig({
                interval_minutes: data.config.interval_minutes,
                runtime_hours: data.config.runtime_hours
            });
            setError(null);
        } catch (error) {
            console.error('Failed to fetch scraper status:', error);
            setError('Failed to connect to scraper');
        }
    };

    const handleStart = async () => {
        setIsUpdating(true);
        setError(null);
        try {
            await api.startScraper();
            await fetchStatus();
        } catch (error) {
            console.error('Failed to start scraper:', error);
            setError('Failed to start scraper');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleStop = async () => {
        setIsUpdating(true);
        setError(null);
        try {
            await api.stopScraper();
            await fetchStatus();
        } catch (error) {
            console.error('Failed to stop scraper:', error);
            setError('Failed to stop scraper');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleConfigUpdate = async () => {
        setIsUpdating(true);
        setError(null);
        try {
            await api.updateScraperConfig(config);
            await fetchStatus();
        } catch (error) {
            console.error('Failed to update config:', error);
            setError('Failed to update configuration');
        } finally {
            setIsUpdating(false);
        }
    };

    const formatNextRun = (nextRun: string | null) => {
        if (!nextRun) return 'N/A';
        const date = new Date(nextRun);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Soon';
        if (minutes < 60) return `${minutes}m`;
        return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    };

    const formatDuration = (startTime: string | null) => {
        if (!startTime) return 'N/A';
        const start = new Date(startTime);
        const now = new Date();
        const diff = now.getTime() - start.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    if (!status) {
        return (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="text-gray-400 flex items-center gap-2">
                    <Activity className="w-5 h-5 animate-spin" />
                    Loading scraper status...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Dynamic News Scraper
                </h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${status.is_running
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${status.is_running ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                    {status.is_running ? 'Running' : 'Stopped'}
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded p-3 mb-4 flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded p-3 border border-gray-700/50">
                    <div className="text-gray-400 text-xs mb-1">Total Runs</div>
                    <div className="text-white text-xl font-bold">{status.stats.total_runs}</div>
                </div>
                <div className="bg-gray-900/50 rounded p-3 border border-gray-700/50">
                    <div className="text-gray-400 text-xs mb-1">Articles</div>
                    <div className="text-white text-xl font-bold">{status.stats.total_articles}</div>
                </div>
                <div className="bg-gray-900/50 rounded p-3 border border-gray-700/50">
                    <div className="text-gray-400 text-xs mb-1">Stories</div>
                    <div className="text-white text-xl font-bold">{status.stats.total_stories}</div>
                </div>
                <div className="bg-gray-900/50 rounded p-3 border border-gray-700/50">
                    <div className="text-gray-400 text-xs mb-1">Errors</div>
                    <div className={`text-xl font-bold ${status.stats.errors > 0 ? 'text-red-400' : 'text-green-400'
                        }`}>{status.stats.errors}</div>
                </div>
            </div>

            {status.is_running && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                        <div className="flex items-center gap-2 text-blue-400 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Next run: <strong>{formatNextRun(status.next_run)}</strong></span>
                        </div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
                        <div className="flex items-center gap-2 text-purple-400 text-sm">
                            <Activity className="w-4 h-4" />
                            <span>Running for: <strong>{formatDuration(status.stats.started_at)}</strong></span>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Configuration</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Scrape Interval (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={config.interval_minutes}
                            onChange={(e) => setConfig({ ...config, interval_minutes: parseInt(e.target.value) || 1 })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                            disabled={status.is_running}
                        />
                        <p className="text-xs text-gray-500 mt-1">How often to scrape news</p>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Runtime Limit (hours)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={config.runtime_hours}
                            onChange={(e) => setConfig({ ...config, runtime_hours: parseInt(e.target.value) || 0 })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                            disabled={status.is_running}
                        />
                        <p className="text-xs text-gray-500 mt-1">0 = run indefinitely</p>
                    </div>
                </div>

                <button
                    onClick={handleConfigUpdate}
                    disabled={status.is_running || isUpdating}
                    className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors font-medium"
                >
                    {isUpdating ? 'Updating...' : 'Update Configuration'}
                </button>
                {status.is_running && (
                    <p className="text-xs text-yellow-500 text-center">Stop the scraper to update configuration</p>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={handleStart}
                    disabled={status.is_running || isUpdating}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <Play className="w-4 h-4" />
                    {isUpdating ? 'Starting...' : 'Start Scraper'}
                </button>

                <button
                    onClick={handleStop}
                    disabled={!status.is_running || isUpdating}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <Square className="w-4 h-4" />
                    {isUpdating ? 'Stopping...' : 'Stop Scraper'}
                </button>
            </div>

            {status.stats.last_run && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                        Last run: {new Date(status.stats.last_run).toLocaleString()}
                    </p>
                </div>
            )}
        </div>
    );
}
