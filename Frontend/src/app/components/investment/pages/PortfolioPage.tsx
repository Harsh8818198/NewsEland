import React, { useEffect, useState } from 'react';
import {
    PieChart,
    Wallet,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    XCircle,
    ExternalLink
} from 'lucide-react';
import { useApiContext } from '../../../services/apiContext';
import { StatCard } from '../StatCard';
import { LoadingSkeleton, ErrorMessage } from '../../ErrorBoundary';

interface Position {
    ticker: string;
    sector: string;
    amount: number;
    shares: number;
    entry_price: number;
    entry_date: string;
    story_id?: string;
    recommendation: any;
}

interface PortfolioSummary {
    cash_reserve: number;
    total_deployed: number;
    positions_count: number;
    sector_exposure: Record<string, number>;
    positions: Record<string, Position>;
}

export function PortfolioPage({ onNavigateToStory }: { onNavigateToStory?: (storyId: string) => void }) {
    const { userProfile, actions } = useApiContext();
    const [data, setData] = useState<PortfolioSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:8000/api/portfolio');
            if (!res.ok) throw new Error('Failed to fetch portfolio');
            const result = await res.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const handleClosePosition = async (ticker: string) => {
        // Mock exit price for now (random 5% gain/loss)
        const position = data?.positions[ticker];
        if (!position) return;

        const mockExitPrice = position.entry_price * (1 + (Math.random() * 0.1 - 0.03)); // -3% to +7%

        if (!confirm(`Close position ${ticker} at $${mockExitPrice.toFixed(2)}?`)) return;

        try {
            const res = await fetch('http://localhost:8000/api/portfolio/close', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticker,
                    exit_price: mockExitPrice
                })
            });

            if (!res.ok) throw new Error('Failed to close position');

            const result = await res.json();
            alert(`Position Closed!\nPnL: $${result.pnl.toFixed(2)} (${(result.pnl_pct * 100).toFixed(2)}%)`);
            fetchPortfolio();
            actions.fetchSystemStatus(); // Update system stats if needed
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    if (loading) return <LoadingSkeleton count={3} height="h-32" />;
    if (error) return <ErrorMessage message={error} onRetry={fetchPortfolio} />;
    if (!data) return null;

    const totalValue = data.cash_reserve + Object.values(data.positions).reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-[#d4af37] to-[#b8941f] rounded-full"></div>
                <div>
                    <h1 className="text-4xl font-serif text-[#2c3e50] font-light tracking-tight mb-2">
                        Portfolio Management
                    </h1>
                    <p className="text-base text-[#6b7280] font-serif">
                        Active positions and capital allocation
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Portfolio Value"
                    value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={Wallet}
                />
                <StatCard
                    title="Cash Reserve"
                    value={`$${data.cash_reserve.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={DollarSign}
                />
                <StatCard
                    title="Deployed Capital"
                    value={`${(data.total_deployed * 100).toFixed(1)}%`}
                    icon={PieChart}
                />
            </div>

            {/* Positions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e3df] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e5e3df] bg-[#faf9f6]">
                    <h3 className="font-serif text-lg text-[#2c3e50] font-medium">Active Positions</h3>
                </div>

                {Object.keys(data.positions).length === 0 ? (
                    <div className="p-8 text-center text-[#6b7280] font-serif">
                        No active positions. Check "Stories" to find investment opportunities.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#faf9f6] text-xs uppercase text-[#6b7280] font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Ticker / Sector</th>
                                    <th className="px-6 py-4 text-right">Size</th>
                                    <th className="px-6 py-4 text-right">Entry Price</th>
                                    <th className="px-6 py-4 text-right">Current Value (Est)</th>
                                    <th className="px-6 py-4 text-center">Story</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e3df]">
                                {Object.entries(data.positions).map(([ticker, pos]) => (
                                    <tr key={ticker} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#2c3e50] text-white rounded-lg flex items-center justify-center font-bold tracking-wide">
                                                    {ticker}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#2c3e50]">{ticker}</div>
                                                    <div className="text-xs text-[#6b7280] uppercase">{pos.sector}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-[#2c3e50]">
                                            ${pos.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-[#6b7280]">
                                            ${pos.entry_price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Mocking a slight gain for visual demo */}
                                            <div className="font-mono font-bold text-emerald-600 flex items-center justify-end gap-1">
                                                ${(pos.amount * 1.02).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                <ArrowUpRight className="w-3 h-3" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {pos.story_id && (
                                                <button
                                                    onClick={() => onNavigateToStory && onNavigateToStory(pos.story_id!)}
                                                    className="text-[#d4af37] hover:text-[#b8941f] hover:underline text-xs font-bold inline-flex items-center gap-1"
                                                >
                                                    View Logic <ExternalLink className="w-3 h-3" />
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleClosePosition(ticker)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors text-xs font-bold flex items-center gap-1 ml-auto"
                                            >
                                                <XCircle className="w-4 h-4" /> Close
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
