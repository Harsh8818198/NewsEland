import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getApiClient, ApiError } from '@/services/api';
import type { BacktestReportResponse } from '@/services/api';

export function BacktestWidget() {
    const [backtest, setBacktest] = useState<BacktestReportResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBacktestReport = async () => {
        try {
            setError(null);
            const api = getApiClient();
            const data = await api.getBacktestReport();
            setBacktest(data);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.userMessage);
            } else {
                setError('Failed to load backtest report');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchBacktestReport();
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBacktestReport();
    }, []);

    if (error) {
        return (
            <div className="border-2 border-[#8b0000] bg-[#8b0000]/10 p-4">
                <Alert className="bg-transparent border-0">
                    <AlertCircle className="h-4 w-4 text-[#8b0000]" />
                    <AlertDescription className="font-serif text-[#8b0000]">{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="border-2 border-[#1a1a1a] p-6 animate-pulse">
                <div className="h-6 bg-[#ede8d8] mb-4" />
                <div className="h-12 bg-[#ede8d8] mb-4" />
                <div className="h-32 bg-[#ede8d8]" />
            </div>
        );
    }

    if (!backtest) {
        return (
            <div className="border-2 border-[#1a1a1a] p-4">
                <p className="text-center font-serif text-[#6b6b6b]">No backtest data available</p>
            </div>
        );
    }

    const winRatePercent = Math.round((backtest.win_rate || 0) * 100);
    const avgReturnPercent = (backtest.avg_return || 0) * 100;
    const isProfit = avgReturnPercent >= 0;

    // Data for visualization
    const performanceData = [
        {
            name: 'Win Rate',
            value: winRatePercent,
            fill: '#006400'
        },
        {
            name: 'Loss Rate',
            value: 100 - winRatePercent,
            fill: '#8b0000'
        }
    ];

    return (
        <div className="border-2 border-[#1a1a1a]">
            {/* Header */}
            <div className="bg-[#1a1a1a] text-[#f5f2e9] px-4 py-3 flex items-center justify-between">
                <h4 className="text-sm uppercase tracking-wider font-serif font-bold">
                    💹 Backtest Performance
                </h4>
                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-[#f5f2e9] hover:bg-[#ffffff]/20"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Win Rate */}
                    <div className="border border-[#1a1a1a] p-3">
                        <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Win Rate</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold font-serif text-[#006400]">
                                {winRatePercent}%
                            </p>
                        </div>
                        <p className="text-xs text-[#6b6b6b] font-serif mt-1">
                            {backtest.validated_predictions} of {backtest.total_predictions} trades
                        </p>
                    </div>

                    {/* Avg Return */}
                    <div className={`border border-[#1a1a1a] p-3 ${isProfit ? 'bg-[#006400]/5' : 'bg-[#8b0000]/5'}`}>
                        <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">Avg Return</p>
                        <div className="flex items-baseline gap-2">
                            <p className={`text-2xl font-bold font-serif ${isProfit ? 'text-[#006400]' : 'text-[#8b0000]'}`}>
                                {isProfit ? '+' : ''}{avgReturnPercent.toFixed(2)}%
                            </p>
                            {isProfit ? (
                                <TrendingUp className="h-4 w-4 text-[#006400]" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-[#8b0000]" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Win Rate Visualization */}
                <div className="border border-[#1a1a1a] p-4">
                    <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-3">Performance Distribution</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={performanceData}>
                            <CartesianGrid vertical={false} stroke="#ede8d8" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b6b6b' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#6b6b6b' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#f5f2e9',
                                    border: '1px solid #1a1a1a',
                                    borderRadius: '0px'
                                }}
                                cursor={{ fill: 'rgba(26, 26, 26, 0.05)' }}
                            />
                            <Bar dataKey="value" radius={0}>
                                {performanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Trade Summary */}
                <div className="border border-[#1a1a1a] p-3 bg-[#ede8d8]">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-serif text-[#6b6b6b]">Total Predictions</span>
                        <span className="font-serif font-bold text-[#1a1a1a]">{backtest.total_predictions}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                        <span className="font-serif text-[#6b6b6b]">Validated Trades</span>
                        <span className="font-serif font-bold text-[#006400]">{backtest.validated_predictions}</span>
                    </div>
                    {backtest.total_predictions > backtest.validated_predictions && (
                        <div className="flex justify-between items-center text-sm mt-2">
                            <span className="font-serif text-[#6b6b6b]">Pending</span>
                            <span className="font-serif font-bold text-[#b8860b]">
                                {backtest.total_predictions - backtest.validated_predictions}
                            </span>
                        </div>
                    )}
                </div>

                {/* Status Message */}
                <p className="text-xs font-serif text-[#6b6b6b] text-center">
                    {backtest.total_predictions === 0
                        ? '📊 No backtest data yet. Run analyses to start tracking.'
                        : backtest.validated_predictions === 0
                            ? '⏳ Waiting for trade outcomes to validate.'
                            : '✅ Backtest data is active and tracking.'}
                </p>
            </div>
        </div>
    );
}
