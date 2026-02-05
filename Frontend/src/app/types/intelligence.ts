// Type definitions for the intelligence briefing platform

export type ImpactHorizon = 'Short' | 'Medium' | 'Long';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export interface ContextPhoto {
  imageQuery: string;
  caption: string;
  interpretation: string;
}

export interface DataPoint {
  label: string;
  value: number;
}

export interface DataVisualization {
  title: string;
  type: 'line' | 'bar';
  data: DataPoint[];
  caption: string;
  interpretation: string;
  yAxisLabel?: string;
}

export interface CauseEffectNode {
  id: string;
  label: string;
  level: number; // 0 = primary cause, 1 = first order, 2 = second order
}

export interface CauseEffectDiagram {
  nodes: CauseEffectNode[];
  caption: string;
  interpretation: string;
}

export interface Signal {
  id: string;
  title: string;
  explanation: string;
  impactHorizon: ImpactHorizon;
  confidence: ConfidenceLevel;
  whatHappened: string;
  whyItMatters: string;
  affected: {
    category: string;
    items: string[];
  }[];
  contextPhoto?: ContextPhoto;
  dataVisualization?: DataVisualization;
  causeEffectDiagram?: CauseEffectDiagram;
}

export interface TimelinePhase {
  period: string;
  events: string[];
  position: number; // 0-100 for positioning
}

export interface ScenarioFlowDiagram {
  phases: TimelinePhase[];
  caption: string;
}

export interface Scenario {
  type: 'continues' | 'weakens' | 'reverses';
  title: string;
  description: string;
  conditions: string[];
  areasOfImpact: string[];
  flowDiagram?: ScenarioFlowDiagram;
}

export interface DailyBrief {
  date: string;
  headline: string;
  signals: Signal[];
}