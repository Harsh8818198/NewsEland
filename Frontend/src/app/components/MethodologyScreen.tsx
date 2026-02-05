import { ArrowLeft } from 'lucide-react';

interface MethodologyScreenProps {
  onBack: () => void;
}

export function MethodologyScreen({ onBack }: MethodologyScreenProps) {
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

      {/* Header */}
      <div className="mb-12 space-y-4">
        <h1 className="intel-text-heading text-[28px] leading-[1.4]">
          Methodology & Trust
        </h1>
        <p className="intel-text-body text-[15px] leading-[1.7] max-w-2xl">
          Understanding how this system processes information, identifies signals, and handles uncertainty.
        </p>
      </div>

      {/* Divider */}
      <div className="intel-divider mb-12" />

      {/* Methodology Sections */}
      <div className="space-y-12">
        {/* How News Is Filtered */}
        <section className="intel-card p-8 space-y-4">
          <h2 className="intel-text-heading text-[19px] leading-[1.5]">
            How News Is Filtered
          </h2>
          <div className="space-y-4">
            <p className="intel-text-body text-[15px] leading-[1.8]">
              The system monitors approximately 2,000 primary sources across financial publications, regulatory filings, central bank communications, and industry-specific outlets. Sources are evaluated based on reliability, original reporting, and subject matter expertise.
            </p>
            <p className="intel-text-body text-[15px] leading-[1.8]">
              Content is filtered using three criteria: materiality (does it affect capital allocation or operational decisions?), novelty (does it represent new information rather than commentary on known events?), and clarity (can the core facts be established with reasonable confidence?).
            </p>
            <p className="intel-text-body text-[15px] leading-[1.8]">
              Opinion pieces, speculation, and derivative analysis are excluded unless they come from principals with direct decision-making authority (e.g., central bank governors, corporate executives in formal communications).
            </p>
          </div>
        </section>

        {/* How Signals Are Identified */}
        <section className="intel-card p-8 space-y-4">
          <h2 className="intel-text-heading text-[19px] leading-[1.5]">
            How Signals Are Identified
          </h2>
          <div className="space-y-4">
            <p className="intel-text-body text-[15px] leading-[1.8]">
              A signal represents a meaningful change in conditions that could alter behavior or outcomes across technology and financial markets. Signals are not predictions—they are observed shifts that warrant attention.
            </p>
            <p className="intel-text-body text-[15px] leading-[1.8]">
              Identification involves pattern recognition across multiple dimensions: policy changes, market structure shifts, technological developments, regulatory evolution, and behavioral changes among key actors. The system looks for confluence—when multiple independent sources or data points support the same underlying narrative.
            </p>
            <p className="intel-text-body text-[15px] leading-[1.8]">
              Signals are prioritized based on potential impact scope (how many entities or systems are affected), time horizon (when effects are likely to materialize), and reversibility (how difficult the shift would be to reverse).
            </p>
          </div>
        </section>

        {/* How Uncertainty Is Handled */}
        <section className="intel-card p-8 space-y-4">
          <h2 className="intel-text-heading text-[19px] leading-[1.5]">
            How Uncertainty Is Handled
          </h2>
          <div className="space-y-4">
            <p className="intel-text-body text-[15px] leading-[1.8]">
              All analysis operates under conditions of incomplete information and uncertain outcomes. Confidence levels reflect the strength of evidence supporting a signal, not the likelihood of a particular outcome.
            </p>
            <p className="intel-text-body text-[15px] leading-[1.8]">
              High confidence means multiple independent sources confirm the core facts and the causal mechanisms are well-understood. Medium confidence indicates solid evidence with some ambiguity about magnitude or timing. Low confidence suggests early indication with limited corroboration or unclear transmission channels.
            </p>
            <p className="intel-text-body text-[15px] leading-[1.8]">
              Scenario analysis explicitly acknowledges that the future is not predictable. Multiple outcomes remain possible depending on decisions by policymakers, market participants, and technological developments. The goal is to map the possibility space, not to forecast a single path.
            </p>
          </div>
        </section>

        {/* Limitations */}
        <section className="intel-card p-8 space-y-4 bg-[var(--intel-bg-secondary)]">
          <h2 className="intel-text-heading text-[19px] leading-[1.5]">
            Limitations
          </h2>
          <div className="space-y-4">
            <p className="intel-text-body text-[15px] leading-[1.8]">
              This system cannot predict discontinuous events (black swans), account for information not yet public, or model complex human behavior with precision. Analysis reflects conditions as they are understood at the time of publication.
            </p>
            <p className="intel-text-body text-[15px] leading-[1.8]">
              Historical patterns inform but do not determine future outcomes. Structural changes in markets, technology, or policy can break historical relationships. Users should combine system analysis with domain expertise and independent judgment.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
