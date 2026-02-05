import { mockDailyBrief } from '@/app/data/mockData';
import { SignalCard } from '@/app/components/SignalCard';

interface DailyBriefScreenProps {
  onSignalClick: (signalId: string) => void;
}

export function DailyBriefScreen({ onSignalClick }: DailyBriefScreenProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Header Section */}
      <div className="mb-12 space-y-6">
        <div className="intel-text-muted text-[13px] uppercase tracking-wide">
          {mockDailyBrief.date}
        </div>
        
        <h1 className="intel-text-heading text-[28px] leading-[1.4] max-w-3xl">
          {mockDailyBrief.headline}
        </h1>
      </div>

      {/* Divider */}
      <div className="intel-divider mb-10" />

      {/* Dominant Signals Section */}
      <div className="space-y-6">
        <h2 className="intel-text-muted text-[13px] uppercase tracking-wide">
          Dominant Signals
        </h2>
        
        <div className="space-y-4">
          {mockDailyBrief.signals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              onClick={() => onSignalClick(signal.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
