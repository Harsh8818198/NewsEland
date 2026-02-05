import { ArrowLeft } from 'lucide-react';
import { mockScenarios } from '@/app/data/mockData';
import { ScenarioFlowDiagram } from '@/app/components/visuals/ScenarioFlowDiagram';

interface ScenarioAnalysisScreenProps {
  onBack: () => void;
}

export function ScenarioAnalysisScreen({ onBack }: ScenarioAnalysisScreenProps) {
  const getScenarioLabel = (type: string) => {
    switch (type) {
      case 'continues':
        return 'If the trend continues';
      case 'weakens':
        return 'If the trend weakens';
      case 'reverses':
        return 'If the trend reverses';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 intel-text-muted text-[14px] mb-8 hover:text-[var(--intel-text-secondary)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to signal
      </button>

      {/* Header */}
      <div className="mb-12 space-y-4">
        <h1 className="intel-text-heading text-[28px] leading-[1.4]">
          Scenario & Impact Analysis
        </h1>
        <p className="intel-text-body text-[15px] leading-[1.7] max-w-2xl">
          Multiple possible futures based on how current conditions evolve. These scenarios emphasize uncertainty and probabilistic thinking rather than prediction.
        </p>
      </div>

      {/* Divider */}
      <div className="intel-divider mb-12" />

      {/* Scenarios */}
      <div className="space-y-12">
        {mockScenarios.map((scenario, index) => (
          <div key={index}>
            <div className="intel-card p-8 space-y-6">
              {/* Scenario Header */}
              <div className="space-y-3">
                <div className="intel-text-muted text-[13px] uppercase tracking-wide">
                  {getScenarioLabel(scenario.type)}
                </div>
                <h2 className="intel-text-heading text-[19px] leading-[1.5]">
                  {scenario.title}
                </h2>
                <p className="intel-text-body text-[15px] leading-[1.7]">
                  {scenario.description}
                </p>
              </div>

              {/* Key Conditions */}
              <div>
                <h3 className="intel-text-heading text-[14px] mb-3">
                  Key Conditions or Triggers
                </h3>
                <ul className="space-y-2">
                  {scenario.conditions.map((condition, condIndex) => (
                    <li key={condIndex} className="intel-text-body text-[15px] leading-[1.7] pl-6 relative">
                      <span className="absolute left-0 top-[0.7em] w-1.5 h-1.5 rounded-full bg-[var(--intel-border)]" />
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas of Impact */}
              <div>
                <h3 className="intel-text-heading text-[14px] mb-3">
                  Areas of Impact
                </h3>
                <ul className="space-y-2">
                  {scenario.areasOfImpact.map((impact, impactIndex) => (
                    <li key={impactIndex} className="intel-text-body text-[15px] leading-[1.7] pl-6 relative">
                      <span className="absolute left-0 top-[0.7em] w-1.5 h-1.5 rounded-full bg-[var(--intel-border)]" />
                      {impact}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Optional Flow Diagram */}
            {scenario.flowDiagram && (
              <ScenarioFlowDiagram data={scenario.flowDiagram} />
            )}
          </div>
        ))}
      </div>

      {/* Uncertainty Note */}
      <div className="mt-12 intel-card p-6 bg-[var(--intel-bg-secondary)]">
        <p className="intel-text-muted text-[13px] leading-[1.7]">
          These scenarios are analytical frameworks, not forecasts. Actual outcomes will likely involve elements from multiple scenarios or emerge from conditions not yet visible.
        </p>
      </div>
    </div>
  );
}