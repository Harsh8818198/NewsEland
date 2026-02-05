import { CauseEffectDiagram as CauseEffectDiagramType } from '@/app/types/intelligence';
import { ArrowRight } from 'lucide-react';

interface CauseEffectDiagramProps {
  data: CauseEffectDiagramType;
}

export function CauseEffectDiagram({ data }: CauseEffectDiagramProps) {
  // Group nodes by level
  const nodesByLevel: { [key: number]: typeof data.nodes } = {};
  data.nodes.forEach(node => {
    if (!nodesByLevel[node.level]) {
      nodesByLevel[node.level] = [];
    }
    nodesByLevel[node.level].push(node);
  });

  const levels = Object.keys(nodesByLevel).map(Number).sort();

  return (
    <div className="space-y-4">
      <div className="intel-card p-8 bg-[var(--intel-bg-secondary)]">
        <div className="space-y-6">
          {levels.map((level, levelIndex) => (
            <div key={level}>
              {/* Level Label */}
              <div className="mb-3">
                <span className="intel-text-muted text-[11px] uppercase tracking-wider">
                  {level === 0 ? 'Primary Cause' : level === 1 ? 'First-Order Effects' : 'Second-Order Effects'}
                </span>
              </div>
              
              {/* Nodes at this level */}
              <div className="flex flex-wrap gap-3 mb-4">
                {nodesByLevel[level].map(node => (
                  <div
                    key={node.id}
                    className="px-4 py-3 bg-[var(--intel-bg-white)] border border-[var(--intel-border)] rounded-sm"
                  >
                    <span className="intel-text-body text-[14px]">
                      {node.label}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Arrow to next level */}
              {levelIndex < levels.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="w-5 h-5 text-[var(--intel-border)] rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="intel-text-muted text-[13px] italic">
          {data.caption}
        </p>
        <p className="intel-text-body text-[14px] leading-[1.7]">
          {data.interpretation}
        </p>
      </div>
    </div>
  );
}
