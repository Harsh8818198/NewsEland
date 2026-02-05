import { ScenarioFlowDiagram as ScenarioFlowDiagramType } from '@/app/types/intelligence';

interface ScenarioFlowDiagramProps {
  data: ScenarioFlowDiagramType;
}

export function ScenarioFlowDiagram({ data }: ScenarioFlowDiagramProps) {
  return (
    <div className="mt-8 space-y-4">
      <h3 className="intel-text-muted text-[13px] uppercase tracking-wide">
        Timeline
      </h3>
      
      <div className="intel-card p-8 bg-[var(--intel-bg-secondary)]">
        {/* Timeline visualization */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 right-0 top-8 h-0.5 bg-[var(--intel-border)]" />
          
          {/* Timeline phases */}
          <div className="relative space-y-12">
            {data.phases.map((phase, index) => (
              <div key={index} className="relative">
                {/* Phase marker */}
                <div 
                  className="absolute top-0 w-3 h-3 rounded-full bg-[var(--intel-text-secondary)]"
                  style={{ left: `${phase.position}%`, transform: 'translateX(-50%)' }}
                />
                
                {/* Phase content */}
                <div 
                  className="pt-12"
                  style={{ paddingLeft: `${Math.min(phase.position, 85)}%` }}
                >
                  <div className="bg-[var(--intel-bg-white)] border border-[var(--intel-border)] p-4 rounded-sm max-w-xs">
                    <div className="intel-text-heading text-[14px] mb-2">
                      {phase.period}
                    </div>
                    <ul className="space-y-1">
                      {phase.events.map((event, eventIndex) => (
                        <li key={eventIndex} className="intel-text-body text-[13px] leading-[1.6] pl-4 relative">
                          <span className="absolute left-0 top-[0.6em] w-1 h-1 rounded-full bg-[var(--intel-border)]" />
                          {event}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <p className="intel-text-muted text-[13px] italic pt-2">
        {data.caption}
      </p>
    </div>
  );
}
