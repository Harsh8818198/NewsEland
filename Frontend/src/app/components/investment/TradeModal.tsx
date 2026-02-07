import React, { useState, useEffect } from 'react';
import { X, DollarSign, Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApiContext } from '../../services/apiContext';

interface TradeModalProps {
    ticker: string;
    sector: string;
    currentPrice: number;
    storyId?: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function TradeModal({ ticker, sector, currentPrice, storyId, onClose, onSuccess }: TradeModalProps) {
    const { userProfile } = useApiContext();
    const [amount, setAmount] = useState<number>(0);
    const [allocationPct, setAllocationPct] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warnings, setWarnings] = useState<string[]>([]);

    const capital = userProfile.data?.capitalAvailable || 100000; // Fallback to 100k if not loaded

    // Update amount when percentage changes
    useEffect(() => {
        setAmount((capital * allocationPct) / 100);
    }, [allocationPct, capital]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setAmount(val);
        setAllocationPct((val / capital) * 100);
    };

    const handlePctChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setAllocationPct(val);
        setAmount((capital * val) / 100);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setWarnings([]);

        try {
            if (amount <= 0) throw new Error("Investment amount must be greater than 0");

            const response = await fetch('http://localhost:8000/api/portfolio/trade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticker,
                    sector,
                    capital_allocation_pct: allocationPct,
                    entry_price: currentPrice,
                    story_id: storyId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Trade execution failed');
            }

            if (data.warnings && data.warnings.length > 0) {
                setWarnings(data.warnings);
                // Don't close immediately if there are warnings, maybe show them?
                // For now, let's treat it as success but show warnings, then close after delay?
                // Actually, existing backend logic executes trade even with warnings if 'approved' is true.
                // If it failed validation, it would return 400.
                // So here, success = true.
            }

            // actions.fetchPortfolio(); // TODO: Implement in apiContext if needed globally
            onSuccess();
            onClose();
            alert(`Trade Executed! ${data.warnings?.join('\n') || ''}`);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const maxAllocation = 0.15 * capital; // 15% max for single position rule
    const isOverLimit = amount > maxAllocation;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#1a252f] to-[#2c3e50] p-6 flex justify-between items-start text-white">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-[#d4af37] text-[#1a1a1a] text-xs font-bold rounded">BUY</span>
                            <h2 className="text-xl font-serif font-bold tracking-wide">{ticker}</h2>
                        </div>
                        <p className="text-white/60 text-xs uppercase tracking-wider font-medium">{sector}</p>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#e5e3df]">
                        <div>
                            <label className="text-[10px] text-[#6b7280] uppercase font-bold block mb-1">Current Price</label>
                            <div className="font-mono text-lg font-bold text-[#2c3e50]">${currentPrice.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                            <label className="text-[10px] text-[#6b7280] uppercase font-bold block mb-1">Available Capital</label>
                            <div className="font-mono text-lg font-bold text-[#2c3e50] flex items-center justify-end gap-1">
                                <Wallet className="w-4 h-4 text-[#d4af37]" />
                                ${capital.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#2c3e50] mb-2 flex justify-between">
                                <span>Investment Amount</span>
                                <span className="text-xs text-[#6b7280]">Max Rec: ${(maxAllocation).toLocaleString()}</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-bold">$</span>
                                </div>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    className={`block w-full pl-7 pr-12 py-3 border-2 rounded-xl focus:ring-0 transition-colors font-mono font-bold text-lg
                    ${isOverLimit ? 'border-red-300 focus:border-red-500 text-red-600' : 'border-[#e5e3df] focus:border-[#d4af37] text-[#2c3e50]'}
                  `}
                                    placeholder="0.00"
                                    min="0"
                                    max={capital}
                                    step="100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#2c3e50] mb-2">Allocation Percentage</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="20" // Cap slider at 20% for safety UI
                                    step="0.5"
                                    value={allocationPct}
                                    onChange={handlePctChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                                />
                                <div className="w-16 font-mono font-bold text-right text-[#2c3e50] border border-[#e5e3df] rounded px-2 py-1">
                                    {allocationPct.toFixed(1)}%
                                </div>
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-[#6b7280] font-medium px-1">
                                <span>0%</span>
                                <span>5%</span>
                                <span>10%</span>
                                <span>15%</span>
                                <span>20%</span>
                            </div>
                        </div>
                    </div>

                    {/* Warnings / Errors */}
                    {isOverLimit && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>Wait! This exceeds the recommended 15% single position limit.</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-[#e5e3df] text-[#6b7280] font-bold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || amount <= 0}
                            className="flex-1 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Executing...' : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Confirm Trade
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
