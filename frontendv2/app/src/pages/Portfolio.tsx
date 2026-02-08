import { useState, useEffect } from 'react';
import { PieChart, ArrowUpRight, ArrowDownRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApiClient, ApiError } from '@/services/api';
import type { PortfolioResponse } from '@/services/api';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Position {
  ticker: string;
  sector: string;
  shares: number;
  entry_price: number;
  current_price: number;
  market_value: number;
  pnl: number;
  pnl_pct: number;
  story_id?: string;
}

function StatBox({ label, value, subtext, trend }: { label: string; value: string; subtext?: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="border border-[#1a1a1a] p-4 text-center">
      <p className="text-xs uppercase tracking-wider text-[#6b6b6b] font-serif mb-1">{label}</p>
      <p className={`text-2xl font-bold font-serif ${trend === 'up' ? 'text-[#006400]' : trend === 'down' ? 'text-[#8b0000]' : 'text-[#1a1a1a]'}`}>
        {value}
      </p>
      {subtext && <p className="text-xs text-[#6b6b6b] font-serif mt-1">{subtext}</p>}
    </div>
  );
}

export function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();
      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
      } else {
        setError('Failed to load portfolio data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolio();
    setRefreshing(false);
    toast.success('Portfolio refreshed');
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Ensure positions is always an array, even if API returns unexpected data
  const positions: Position[] = Array.isArray(portfolio?.positions)
    ? portfolio.positions
    : [];
  const totalValue = portfolio?.total_value || 0;
  const totalPnl = portfolio?.total_pnl || 0;
  const totalPnlPct = portfolio?.total_pnl_pct || 0;
  const cash = portfolio?.cash || 0;

  const sectorData = positions.reduce((acc, pos) => {
    const existing = acc.find(item => item.name === pos.sector);
    if (existing) {
      existing.value += pos.market_value;
    } else {
      acc.push({ name: pos.sector, value: pos.market_value });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const chartData = positions.map(pos => ({
    name: pos.ticker,
    pnl: pos.pnl,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b-2 border-[#1a1a1a] pb-4">
        <h1 className="headline-main text-center">Portfolio Chronicle</h1>
        <p className="text-center font-serif text-[#6b6b6b] mt-2">
          Your investment holdings and performance metrics
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-[#8b0000]/10 border-[#8b0000] text-[#8b0000]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox
          label="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          subtext="Assets Under Management"
        />
        <StatBox
          label="Total P&L"
          value={`${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toLocaleString()}`}
          subtext={`${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`}
          trend={totalPnl >= 0 ? 'up' : 'down'}
        />
        <StatBox
          label="Cash Position"
          value={`$${cash.toLocaleString()}`}
          subtext="Available for Investment"
        />
        <StatBox
          label="Positions"
          value={positions.length.toString()}
          subtext="Active Holdings"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Positions Table */}
        <div className="lg:col-span-2">
          <div className="border-2 border-[#1a1a1a] p-6">
            <div className="flex items-center justify-between mb-4 border-b border-[#1a1a1a] pb-2">
              <h4 className="uppercase tracking-wider text-sm font-serif font-bold">
                Current Holdings
              </h4>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-newspaper text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-full bg-[#ede8d8]" />
                ))}
              </div>
            ) : positions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="newspaper-table">
                  <thead>
                    <tr>
                      <th>Ticker</th>
                      <th>Sector</th>
                      <th className="text-right">Shares</th>
                      <th className="text-right">Entry</th>
                      <th className="text-right">Current</th>
                      <th className="text-right">Value</th>
                      <th className="text-right">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position) => (
                      <tr key={position.ticker}>
                        <td className="font-bold">{position.ticker}</td>
                        <td>{position.sector}</td>
                        <td className="text-right">{position.shares}</td>
                        <td className="text-right">${position.entry_price.toFixed(2)}</td>
                        <td className="text-right">${position.current_price.toFixed(2)}</td>
                        <td className="text-right">${position.market_value.toLocaleString()}</td>
                        <td className="text-right">
                          <div className={`flex items-center justify-end gap-1 ${position.pnl >= 0 ? 'text-[#006400]' : 'text-[#8b0000]'}`}>
                            {position.pnl >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            <span>${Math.abs(position.pnl).toLocaleString()}</span>
                            <span className="tag-newspaper text-xs ml-1">
                              {position.pnl >= 0 ? '+' : ''}{position.pnl_pct.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <PieChart className="h-12 w-12 text-[#6b6b6b] mx-auto mb-4" />
                <h3 className="headline-tertiary mb-2">No Positions</h3>
                <p className="font-serif text-[#4a4a4a]">Your portfolio is currently empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* P&L Chart */}
          <div className="border border-[#1a1a1a] p-4">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
              P&L by Position
            </h4>
            {positions.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d4d0c0" />
                  <XAxis dataKey="name" stroke="#4a4a4a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4a4a4a" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f5f2e9',
                      border: '1px solid #1a1a1a',
                      fontFamily: 'Libre Baskerville, serif'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'P&L']}
                  />
                  <Bar dataKey="pnl">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#006400' : '#8b0000'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[#6b6b6b] font-serif">
                No data available
              </div>
            )}
          </div>

          {/* Sector Allocation */}
          <div className="border border-[#1a1a1a] p-4">
            <h4 className="text-center uppercase tracking-wider text-sm font-serif font-bold border-b border-[#1a1a1a] pb-2 mb-4">
              Sector Allocation
            </h4>
            {sectorData.length > 0 ? (
              <div className="space-y-2">
                {sectorData.map((sector) => {
                  const percentage = totalValue > 0 ? (sector.value / totalValue) * 100 : 0;
                  return (
                    <div key={sector.name} className="flex items-center justify-between">
                      <span className="text-sm font-serif">{sector.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-serif text-[#4a4a4a]">${sector.value.toLocaleString()}</span>
                        <span className="tag-newspaper text-xs">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center font-serif text-[#6b6b6b]">No sector data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
