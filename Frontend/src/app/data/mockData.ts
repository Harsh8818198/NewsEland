import { DailyBrief, Signal, Scenario } from '@/app/types/intelligence';

export const mockDailyBrief: DailyBrief = {
  date: 'Tuesday, February 3, 2026',
  headline: 'Central bank policy shifts signal tightening cycle amid persistent inflation pressures',
  signals: [
    {
      id: 'signal-1',
      title: 'Federal Reserve signals extended restrictive policy stance',
      explanation: 'FOMC communications indicate rates will remain elevated longer than market pricing suggests',
      impactHorizon: 'Medium',
      confidence: 'High',
      whatHappened: 'In prepared remarks following the January FOMC meeting, Chair Powell emphasized that inflation remains above target levels and that the Committee will maintain restrictive monetary policy until sustained progress is evident. Market expectations had priced in rate cuts beginning Q2 2026, but the tone suggests a later timeline.',
      whyItMatters: 'Extended high rates fundamentally alter the cost of capital across the economy. Growth-stage technology companies that rely on equity financing face compressed valuations, while debt-heavy sectors experience margin pressure. The divergence between market expectations and Fed communications creates volatility risk.',
      affected: [
        {
          category: 'Technology Sectors',
          items: ['High-growth SaaS platforms', 'Early-stage AI infrastructure', 'Venture-backed fintech'],
        },
        {
          category: 'Financial Systems',
          items: ['Credit markets', 'Private equity deployment', 'M&A activity'],
        },
        {
          category: 'Market Behaviors',
          items: ['Risk appetite decline', 'Flight to quality assets', 'Reduced speculative positioning'],
        },
      ],
      contextPhoto: {
        imageQuery: 'federal reserve building washington',
        caption: 'Federal Reserve headquarters in Washington, D.C.',
        interpretation: 'The Federal Reserve\'s physical presence in the capital symbolizes its central role in managing monetary policy, where decisions made in these buildings ripple across global financial markets.',
      },
      dataVisualization: {
        title: 'Federal Funds Rate Path',
        type: 'line',
        data: [
          { label: 'Q1 2025', value: 4.5 },
          { label: 'Q2 2025', value: 4.75 },
          { label: 'Q3 2025', value: 5.0 },
          { label: 'Q4 2025', value: 5.25 },
          { label: 'Q1 2026', value: 5.25 },
          { label: 'Q2 2026 (projected)', value: 5.0 },
        ],
        caption: 'Federal funds effective rate trajectory showing elevated levels through early 2026',
        interpretation: 'The prolonged plateau at 5.25% represents a historically restrictive stance. Market expectations for Q2 2026 cuts (shown in projection) diverge from Fed communications suggesting a later timeline.',
        yAxisLabel: 'Rate (%)',
      },
      causeEffectDiagram: {
        nodes: [
          { id: 'primary', label: 'Extended High Rates', level: 0 },
          { id: 'first-1', label: 'Elevated Cost of Capital', level: 1 },
          { id: 'first-2', label: 'Compressed Valuations', level: 1 },
          { id: 'second-1', label: 'Reduced VC Deployment', level: 2 },
          { id: 'second-2', label: 'Slower Tech Innovation', level: 2 },
          { id: 'second-3', label: 'M&A Activity Declines', level: 2 },
        ],
        caption: 'Second-order effects cascade from monetary policy through technology markets',
        interpretation: 'The primary policy shift creates immediate financing pressures, which then propagate through investment behaviors and ultimately affect the pace of technological development and market consolidation.',
      },
    },
    {
      id: 'signal-2',
      title: 'Semiconductor supply constraints resurface in advanced nodes',
      explanation: 'Leading foundries report capacity limitations for 3nm and below processes as AI demand surges',
      impactHorizon: 'Short',
      confidence: 'Medium',
      whatHappened: 'TSMC and Samsung disclosed that order lead times for their most advanced manufacturing processes have extended to 18+ months. This follows significant capacity additions announced in 2024-2025 that were expected to ease constraints. The bottleneck appears concentrated in extreme ultraviolet lithography tooling availability.',
      whyItMatters: 'AI model training and inference workloads require cutting-edge chips. Supply limitations force prioritization decisions that advantage established hyperscalers with long-term capacity agreements, while emerging AI companies face delayed product timelines. This could slow the pace of AI deployment across enterprise sectors.',
      affected: [
        {
          category: 'Technology Sectors',
          items: ['AI model developers', 'Cloud infrastructure providers', 'Consumer electronics'],
        },
        {
          category: 'Industrial Systems',
          items: ['Semiconductor equipment manufacturers', 'Advanced packaging facilities'],
        },
        {
          category: 'Competitive Dynamics',
          items: ['Incumbent advantage strengthening', 'Startup execution risk'],
        },
      ],
      contextPhoto: {
        imageQuery: 'semiconductor manufacturing factory clean room',
        caption: 'Advanced semiconductor fabrication facility with cleanroom environment',
        interpretation: 'Modern chip manufacturing requires extraordinarily controlled environments and specialized equipment. The complexity and capital intensity of these facilities—combined with limited supplier capacity—creates structural bottlenecks that cannot be resolved quickly.',
      },
      dataVisualization: {
        title: 'Advanced Node Lead Times',
        type: 'bar',
        data: [
          { label: 'Q1 2024', value: 9 },
          { label: 'Q2 2024', value: 10 },
          { label: 'Q3 2024', value: 12 },
          { label: 'Q4 2024', value: 14 },
          { label: 'Q1 2025', value: 15 },
          { label: 'Q4 2025', value: 18 },
        ],
        caption: 'Order-to-delivery lead times for 3nm and below process nodes (in months)',
        interpretation: 'The steady increase in lead times despite capacity investments indicates demand is outpacing supply additions. The 18-month timeline creates significant planning challenges and execution risk for companies dependent on cutting-edge silicon.',
        yAxisLabel: 'Months',
      },
    },
    {
      id: 'signal-3',
      title: 'European regulatory framework for AI systems nears implementation',
      explanation: 'EU AI Act enforcement begins in phases starting Q3 2026, requiring significant compliance infrastructure',
      impactHorizon: 'Long',
      confidence: 'High',
      whatHappened: 'The European Commission published detailed technical standards for AI system classification and risk assessment. Companies deploying high-risk AI applications in EU markets must implement documentation, testing, and oversight protocols by September 2026. Non-compliance carries fines up to 6% of global revenue.',
      whyItMatters: 'The EU framework establishes the first comprehensive regulatory structure for AI, likely influencing global standards. Compliance costs are substantial—particularly for transparency and explainability requirements—creating barriers to entry for smaller players. This may accelerate market consolidation around firms with regulatory expertise.',
      affected: [
        {
          category: 'Technology Sectors',
          items: ['Enterprise AI platforms', 'Healthcare AI diagnostics', 'Financial risk modeling systems'],
        },
        {
          category: 'Operational Requirements',
          items: ['Legal and compliance teams', 'Technical documentation processes', 'Model governance frameworks'],
        },
        {
          category: 'Strategic Positioning',
          items: ['Market access decisions', 'Product development priorities', 'Partnership structures'],
        },
      ],
    },
    {
      id: 'signal-4',
      title: 'Corporate technology spending patterns shift toward efficiency over expansion',
      explanation: 'CIO surveys indicate 2026 budgets prioritize cost reduction and consolidation rather than new capabilities',
      impactHorizon: 'Medium',
      confidence: 'Medium',
      whatHappened: 'Gartner and Forrester surveys of enterprise technology leaders show a marked change in spending priorities. Rather than adding new tools or expanding headcount, 68% of respondents prioritize vendor consolidation, automation of existing workflows, and renegotiating contracts. This represents a shift from the 2023-2024 expansionary environment.',
      whyItMatters: 'The software-as-a-service model depends on net revenue retention and expansion within existing customer bases. A defensive spending posture limits upsell opportunities and increases churn risk for non-essential tools. Companies without clear ROI narratives or sticky workflows face pressure, while efficiency-enabling software may see increased demand.',
      affected: [
        {
          category: 'Technology Sectors',
          items: ['Point solution SaaS vendors', 'Collaboration tools', 'Niche productivity applications'],
        },
        {
          category: 'Business Models',
          items: ['Land-and-expand strategies', 'Usage-based pricing', 'Multi-product bundling'],
        },
        {
          category: 'Market Dynamics',
          items: ['Increased price sensitivity', 'Longer sales cycles', 'Heightened competitive pressure'],
        },
      ],
    },
  ],
};

export const mockScenarios: Scenario[] = [
  {
    type: 'continues',
    title: 'Trend Continuation: Extended High-Rate Environment',
    description: 'Monetary policy remains restrictive through 2026 with rates stable or increasing. Inflation declines slowly, requiring sustained Fed vigilance.',
    conditions: [
      'Core PCE inflation remains above 2.5% through mid-2026',
      'Labor markets show continued resilience with wage growth exceeding productivity',
      'No significant credit events or financial stability concerns emerge',
    ],
    areasOfImpact: [
      'Technology valuations compress further as discount rates remain elevated',
      'M&A activity stays subdued with expensive financing limiting transactions',
      'Cash-generative businesses outperform growth-stage companies',
      'Private equity distributions decline as exit markets remain challenging',
      'Credit-sensitive sectors face margin pressure and potential defaults',
    ],
    flowDiagram: {
      phases: [
        {
          period: 'Q1-Q2 2026',
          events: ['Rates remain at 5.25%', 'Inflation gradual decline', 'Market volatility persists'],
          position: 20,
        },
        {
          period: 'Q3-Q4 2026',
          events: ['Fed maintains restrictive stance', 'Credit conditions tighten', 'Growth slows moderately'],
          position: 50,
        },
        {
          period: 'Early 2027',
          events: ['Valuation compression deepens', 'Funding environment constrained', 'Sector consolidation accelerates'],
          position: 80,
        },
      ],
      caption: 'Timeline showing how extended restrictive policy propagates through financial markets and technology sectors over 12+ months',
    },
  },
  {
    type: 'weakens',
    title: 'Trend Weakening: Modest Policy Easing',
    description: 'Inflation progress allows the Fed to begin gradual rate cuts in mid-2026. Policy normalizes slowly with emphasis on stability rather than stimulus.',
    conditions: [
      'Inflation trends toward target with core measures below 2.3% by Q3 2026',
      'Economic growth moderates but remains positive',
      'Fed gains confidence that progress is sustainable without additional tightening',
    ],
    areasOfImpact: [
      'Growth equity valuations recover partially as cost of capital declines',
      'M&A activity increases as financing becomes more attractive',
      'Technology sector funding environment improves gradually',
      'Credit spreads narrow, easing refinancing pressure on leveraged companies',
      'Risk appetite returns incrementally across asset classes',
    ],
    flowDiagram: {
      phases: [
        {
          period: 'Q2 2026',
          events: ['Inflation data improves', 'Fed signals policy flexibility', 'Market sentiment shifts'],
          position: 15,
        },
        {
          period: 'Q3 2026',
          events: ['First rate cut (25 bps)', 'Credit conditions ease', 'Valuation recovery begins'],
          position: 45,
        },
        {
          period: 'Q4 2026-Q1 2027',
          events: ['Additional modest cuts', 'Funding activity increases', 'M&A pipeline builds'],
          position: 75,
        },
      ],
      caption: 'Timeline showing gradual policy normalization and corresponding improvements in financing conditions and market sentiment',
    },
  },
  {
    type: 'reverses',
    title: 'Trend Reversal: Financial Stability Event Forces Easing',
    description: 'Stress in credit markets or unexpected economic weakness compels the Fed to pivot rapidly toward accommodation despite incomplete inflation progress.',
    conditions: [
      'Credit event in commercial real estate or leveraged loan markets creates contagion risk',
      'Unemployment rises sharply as lagged effects of high rates materialize',
      'Banking sector stress requires liquidity support and rate relief',
    ],
    areasOfImpact: [
      'Technology sector benefits from improved risk sentiment despite macro uncertainty',
      'Credit markets experience volatility before stabilizing with policy support',
      'Flight to quality creates bifurcated performance across asset classes',
      'Regulatory scrutiny increases on financial institutions and systemic risks',
      'Long-term inflation expectations become unanchored, complicating policy',
    ],
    flowDiagram: {
      phases: [
        {
          period: 'Trigger Event',
          events: ['Credit stress emerges', 'Contagion concerns rise', 'Market dislocations'],
          position: 10,
        },
        {
          period: 'Policy Response',
          events: ['Emergency rate cuts', 'Liquidity facilities activated', 'Volatility spike'],
          position: 35,
        },
        {
          period: 'Stabilization Phase',
          events: ['Markets stabilize gradually', 'Bifurcated outcomes emerge', 'Regulatory tightening'],
          position: 70,
        },
      ],
      caption: 'Timeline showing rapid policy reversal in response to financial stability concerns, with near-term volatility followed by gradual stabilization',
    },
  },
];

export const mockExampleQuestions = [
  'Why does this matter for technology companies specifically?',
  'Who benefits if this trend continues?',
  'What would invalidate this signal?',
  'How does this compare to similar historical periods?',
  'What are the second-order effects on supply chains?',
  'Which market segments are most exposed to this risk?',
];

export function getSignalById(id: string): Signal | undefined {
  return mockDailyBrief.signals.find((signal) => signal.id === id);
}