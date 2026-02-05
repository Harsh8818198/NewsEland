import { useState } from 'react';
import { SystemStatusBadge } from '../Badge';
import { mockSystemHealth } from '@/app/data/investmentMockData';
import {
  Activity,
  Database,
  Zap,
  Layers,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export function SystemStatusPage() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const handleResetMemory = () => {
    setShowResetConfirm(false);
    // Handle reset
  };

  const modules = [
    {
      id: 'ingestion',
      name: 'Ingestion Module',
      icon: Database,
      description: 'Collects and processes financial news from multiple sources',
      status: mockSystemHealth.ingestion.status,
      lastUpdate: mockSystemHealth.ingestion.lastUpdate,
      metrics: [
        { label: 'Articles Processed', value: mockSystemHealth.ingestion.articlesProcessed },
        { label: 'Sources Active', value: 12 },
        { label: 'Average Latency', value: '2.3s' },
      ],
    },
    {
      id: 'analysis',
      name: 'Analysis Module',
      icon: Zap,
      description: 'Extracts entities, evaluates sentiment, and generates insights',
      status: mockSystemHealth.analysis.status,
      lastUpdate: mockSystemHealth.analysis.lastUpdate,
      metrics: [
        { label: 'Analyses Completed', value: mockSystemHealth.analysis.analysisCount },
        { label: 'Average Processing Time', value: '1.8s' },
        { label: 'Accuracy Score', value: '94.2%' },
      ],
    },
    {
      id: 'memory',
      name: 'Memory Module',
      icon: Layers,
      description: 'Tracks stories over time and maintains historical context',
      status: mockSystemHealth.memory.status,
      lastUpdate: mockSystemHealth.memory.lastUpdate,
      metrics: [
        { label: 'Stories Tracked', value: mockSystemHealth.memory.storiesTracked },
        { label: 'Total Updates', value: 327 },
        { label: 'Average Story Age', value: '14 days' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-[var(--fintech-text-primary)] mb-2">
            System Status
          </h1>
          <p className="text-[15px] text-[var(--fintech-text-secondary)]">
            Real-time health monitoring and system controls
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--fintech-bg)] hover:bg-[var(--fintech-border)] border border-[var(--fintech-border)] text-[var(--fintech-text-primary)] rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh News
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[var(--fintech-danger)] rounded-lg font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Reset Memory
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#F0FDF4] rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[var(--fintech-success)]" />
            </div>
            <div>
              <h2 className="text-[20px] font-semibold text-[var(--fintech-text-primary)] mb-1">
                All Systems Operational
              </h2>
              <p className="text-[14px] text-[var(--fintech-text-secondary)]">
                Last system check: 30 seconds ago
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[32px] font-semibold text-[var(--fintech-success)]">100%</div>
            <div className="text-[13px] text-[var(--fintech-text-muted)]">Uptime (24h)</div>
          </div>
        </div>
      </div>

      {/* Module Status Cards */}
      <div className="space-y-4">
        {modules.map((module) => {
          const Icon = module.icon;

          return (
            <div
              key={module.id}
              className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-[var(--fintech-accent)]" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-semibold text-[var(--fintech-text-primary)] mb-1">
                      {module.name}
                    </h3>
                    <p className="text-[14px] text-[var(--fintech-text-secondary)] mb-3">
                      {module.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <SystemStatusBadge status={module.status} />
                      <span className="text-[13px] text-[var(--fintech-text-muted)]">
                        Last update: {module.lastUpdate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--fintech-border)]">
                {module.metrics.map((metric, index) => (
                  <div key={index} className="bg-[var(--fintech-bg)] rounded-lg p-4">
                    <div className="text-[13px] text-[var(--fintech-text-muted)] mb-1">
                      {metric.label}
                    </div>
                    <div className="text-[20px] font-semibold text-[var(--fintech-text-primary)]">
                      {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Story Count Metrics */}
      <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
        <h2 className="text-[18px] font-semibold text-[var(--fintech-text-primary)] mb-4">
          Story Metrics
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[var(--fintech-bg)] rounded-lg p-4">
            <div className="text-[13px] text-[var(--fintech-text-muted)] mb-1">Total Stories</div>
            <div className="text-[24px] font-semibold text-[var(--fintech-text-primary)]">47</div>
          </div>
          <div className="bg-[var(--fintech-bg)] rounded-lg p-4">
            <div className="text-[13px] text-[var(--fintech-text-muted)] mb-1">Developing</div>
            <div className="text-[24px] font-semibold text-[var(--fintech-text-primary)]">19</div>
          </div>
          <div className="bg-[var(--fintech-bg)] rounded-lg p-4">
            <div className="text-[13px] text-[var(--fintech-text-muted)] mb-1">Mature</div>
            <div className="text-[24px] font-semibold text-[var(--fintech-text-primary)]">28</div>
          </div>
          <div className="bg-[var(--fintech-bg)] rounded-lg p-4">
            <div className="text-[13px] text-[var(--fintech-text-muted)] mb-1">Updates Today</div>
            <div className="text-[24px] font-semibold text-[var(--fintech-text-primary)]">8</div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-[var(--fintech-card)] rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FEF2F2] rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-[var(--fintech-danger)]" />
              </div>
              <div>
                <h3 className="text-[18px] font-semibold text-[var(--fintech-text-primary)] mb-1">
                  Reset Memory
                </h3>
                <p className="text-[14px] text-[var(--fintech-text-secondary)]">
                  This will delete all tracked stories and historical data. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-[var(--fintech-bg)] hover:bg-[var(--fintech-border)] border border-[var(--fintech-border)] text-[var(--fintech-text-primary)] rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetMemory}
                className="flex-1 px-4 py-2.5 bg-[var(--fintech-danger)] hover:bg-[#B91C1C] text-white rounded-lg font-medium transition-colors"
              >
                Reset Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
