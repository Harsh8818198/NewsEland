import { Signal } from '@/app/types/intelligence';

interface SignalCardProps {
  signal: Signal;
  onClick: () => void;
}

export function SignalCard({ signal, onClick }: SignalCardProps) {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return 'bg-[var(--intel-confidence-high)]';
      case 'Medium':
        return 'bg-[var(--intel-confidence-medium)]';
      case 'Low':
        return 'bg-[var(--intel-confidence-low)]';
      default:
        return 'bg-[var(--intel-confidence-medium)]';
    }
  };

  const getHorizonColor = (horizon: string) => {
    switch (horizon) {
      case 'Long':
        return 'text-[var(--intel-horizon-long)]';
      case 'Medium':
        return 'text-[var(--intel-horizon-medium)]';
      case 'Short':
        return 'text-[var(--intel-horizon-short)]';
      default:
        return 'text-[var(--intel-text-muted)]';
    }
  };

  return (
    <button
      onClick={onClick}
      className="intel-card w-full text-left p-8 hover:shadow-sm transition-shadow duration-200"
    >
      <div className="space-y-3">
        <h3 className="intel-text-heading text-[17px] leading-[1.6]">
          {signal.title}
        </h3>
        
        <p className="intel-text-body text-[15px] leading-[1.7]">
          {signal.explanation}
        </p>
        
        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <span className="intel-text-muted text-[13px] uppercase tracking-wide">
              Impact
            </span>
            <span className={`text-[13px] tracking-wide ${getHorizonColor(signal.impactHorizon)}`}>
              {signal.impactHorizon} term
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="intel-text-muted text-[13px] uppercase tracking-wide">
              Confidence
            </span>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${getConfidenceColor('Low')}`} />
              <div className={`w-1.5 h-1.5 rounded-full ${
                signal.confidence === 'Medium' || signal.confidence === 'High' 
                  ? getConfidenceColor(signal.confidence) 
                  : 'bg-gray-200'
              }`} />
              <div className={`w-1.5 h-1.5 rounded-full ${
                signal.confidence === 'High' 
                  ? getConfidenceColor(signal.confidence) 
                  : 'bg-gray-200'
              }`} />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
