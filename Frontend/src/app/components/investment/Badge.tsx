import { Sentiment, Maturity, SystemStatus } from '@/app/types/investment';

interface SentimentBadgeProps {
  sentiment: Sentiment;
  size?: 'sm' | 'md';
}

export function SentimentBadge({ sentiment, size = 'md' }: SentimentBadgeProps) {
  const colors = {
    positive: 'bg-[#ECFDF5] text-[var(--fintech-positive)] border-[#A7F3D0]',
    neutral: 'bg-[#F3F4F6] text-[var(--fintech-neutral)] border-[#D1D5DB]',
    negative: 'bg-[#FEF2F2] text-[var(--fintech-negative)] border-[#FECACA]',
  };

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-[13px] px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${colors[sentiment]} ${sizeClasses}`}
    >
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </span>
  );
}

interface MaturityBadgeProps {
  maturity: Maturity;
  size?: 'sm' | 'md';
}

export function MaturityBadge({ maturity, size = 'md' }: MaturityBadgeProps) {
  const colors = {
    Developing: 'bg-[#FEF3C7] text-[var(--fintech-warning)] border-[#FDE68A]',
    Mature: 'bg-[#DBEAFE] text-[var(--fintech-accent)] border-[#BFDBFE]',
  };

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-[13px] px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${colors[maturity]} ${sizeClasses}`}
    >
      {maturity}
    </span>
  );
}

interface SystemStatusBadgeProps {
  status: SystemStatus;
}

export function SystemStatusBadge({ status }: SystemStatusBadgeProps) {
  const config = {
    healthy: {
      bg: 'bg-[#F0FDF4]',
      text: 'text-[var(--fintech-success)]',
      border: 'border-[#BBF7D0]',
      label: 'Healthy',
    },
    warning: {
      bg: 'bg-[#FFFBEB]',
      text: 'text-[var(--fintech-warning)]',
      border: 'border-[#FDE68A]',
      label: 'Warning',
    },
    error: {
      bg: 'bg-[#FEF2F2]',
      text: 'text-[var(--fintech-danger)]',
      border: 'border-[#FECACA]',
      label: 'Error',
    },
  };

  const { bg, text, border, label } = config[status];

  return (
    <span
      className={`inline-flex items-center font-medium rounded border text-[13px] px-2.5 py-1 ${bg} ${text} ${border}`}
    >
      {label}
    </span>
  );
}
