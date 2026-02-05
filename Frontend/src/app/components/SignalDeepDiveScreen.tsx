import { ArrowLeft } from 'lucide-react';
import { Signal } from '@/app/types/intelligence';
import { ContextPhoto } from '@/app/components/visuals/ContextPhoto';
import { DataVisualization } from '@/app/components/visuals/DataVisualization';
import { CauseEffectDiagram } from '@/app/components/visuals/CauseEffectDiagram';

interface SignalDeepDiveScreenProps {
  signal: Signal;
  onBack: () => void;
  onViewScenarios: () => void;
}

export function SignalDeepDiveScreen({ signal, onBack, onViewScenarios }: SignalDeepDiveScreenProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 intel-text-muted text-[14px] mb-8 hover:text-[var(--intel-text-secondary)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to briefing
      </button>

      {/* Signal Header */}
      <div className="mb-12 space-y-6">
        <h1 className="intel-text-heading text-[28px] leading-[1.4]">
          {signal.title}
        </h1>
        
        <p className="intel-text-body text-[17px] leading-[1.7]">
          {signal.explanation}
        </p>
      </div>

      {/* Divider */}
      <div className="intel-divider mb-12" />

      {/* Analysis Sections */}
      <div className="space-y-12">
        {/* What Happened */}
        <section>
          <h2 className="intel-text-muted text-[13px] uppercase tracking-wide mb-4">
            What Happened
          </h2>
          <div className="intel-card p-8">
            <p className="intel-text-body text-[15px] leading-[1.8]">
              {signal.whatHappened}
            </p>
          </div>
        </section>

        {/* Optional Context Photo */}
        {signal.contextPhoto && (
          <section>
            <ContextPhoto data={signal.contextPhoto} />
          </section>
        )}

        {/* Why This Matters */}
        <section>
          <h2 className="intel-text-muted text-[13px] uppercase tracking-wide mb-4">
            Why This Matters
          </h2>
          <div className="intel-card p-8">
            <p className="intel-text-body text-[15px] leading-[1.8]">
              {signal.whyItMatters}
            </p>
          </div>
        </section>

        {/* Optional Data Visualization */}
        {signal.dataVisualization && (
          <section>
            <DataVisualization data={signal.dataVisualization} />
          </section>
        )}

        {/* Who or What Is Affected */}
        <section>
          <h2 className="intel-text-muted text-[13px] uppercase tracking-wide mb-4">
            Who or What Is Affected
          </h2>
          <div className="intel-card p-8 space-y-8">
            {signal.affected.map((group, index) => (
              <div key={index}>
                <h3 className="intel-text-heading text-[15px] mb-3">
                  {group.category}
                </h3>
                <ul className="space-y-2">
                  {group.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="intel-text-body text-[15px] leading-[1.8] pl-6 relative">
                      <span className="absolute left-0 top-[0.7em] w-1.5 h-1.5 rounded-full bg-[var(--intel-border)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Optional Cause-Effect Diagram */}
        {signal.causeEffectDiagram && (
          <section>
            <CauseEffectDiagram data={signal.causeEffectDiagram} />
          </section>
        )}
      </div>

      {/* View Scenarios CTA */}
      <div className="mt-12 pt-12 border-t border-[var(--intel-border)]">
        <button
          onClick={onViewScenarios}
          className="intel-text-body text-[15px] px-6 py-3 bg-[var(--intel-bg-secondary)] hover:bg-[var(--intel-border)] transition-colors rounded-sm"
        >
          View scenario analysis
        </button>
      </div>
    </div>
  );
}