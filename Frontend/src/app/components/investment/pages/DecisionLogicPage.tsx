import { Brain, Shield, Zap, Target, TrendingDown } from 'lucide-react';

export function DecisionLogicPage() {
  const strategies = [
    {
      name: 'Conservative Strategy',
      icon: Shield,
      color: 'text-[#059669]',
      bgColor: 'bg-[#ECFDF5]',
      borderColor: 'border-[#A7F3D0]',
      steps: [
        {
          title: 'Story Classification',
          description:
            'Identifies stories with established track records and mature development cycles',
        },
        {
          title: 'Sentiment Filtering',
          description:
            'Prioritizes neutral to positive sentiment patterns with low volatility',
        },
        {
          title: 'Risk Assessment',
          description:
            'Evaluates downside protection and defensive characteristics of affected sectors',
        },
        {
          title: 'Recommendation Generation',
          description:
            'Suggests established companies with strong balance sheets and proven business models',
        },
      ],
    },
    {
      name: 'Aggressive Strategy',
      icon: Zap,
      color: 'text-[#2563EB]',
      bgColor: 'bg-[#EEF2FF]',
      borderColor: 'border-[#BFDBFE]',
      steps: [
        {
          title: 'Emerging Story Detection',
          description: 'Identifies developing stories with high growth potential and momentum',
        },
        {
          title: 'Volatility Analysis',
          description:
            'Accepts higher sentiment swings and prioritizes asymmetric upside opportunities',
        },
        {
          title: 'Growth Potential',
          description:
            'Focuses on innovation-driven sectors and companies with expanding addressable markets',
        },
        {
          title: 'Recommendation Generation',
          description:
            'Suggests high-growth companies and emerging market opportunities with calculated risk',
        },
      ],
    },
    {
      name: 'Contrarian Strategy',
      icon: TrendingDown,
      color: 'text-[#D97706]',
      bgColor: 'bg-[#FEF3C7]',
      borderColor: 'border-[#FDE68A]',
      steps: [
        {
          title: 'Sentiment Divergence',
          description:
            'Identifies stories where negative sentiment exceeds fundamental deterioration',
        },
        {
          title: 'Value Assessment',
          description:
            'Evaluates whether market pricing reflects excessive pessimism or structural change',
        },
        {
          title: 'Recovery Potential',
          description:
            'Analyzes catalysts and conditions that could drive sentiment normalization',
        },
        {
          title: 'Recommendation Generation',
          description:
            'Suggests undervalued opportunities in out-of-favor sectors with long-term potential',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-semibold text-[var(--fintech-text-primary)] mb-2">
          Decision Logic
        </h1>
        <p className="text-[15px] text-[var(--fintech-text-secondary)]">
          Understand how the AI makes investment recommendations based on different risk profiles
        </p>
      </div>

      {/* Overview Card */}
      <div className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-[var(--fintech-accent)]" />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-[var(--fintech-text-primary)] mb-2">
              How the AI Works
            </h2>
            <p className="text-[15px] text-[var(--fintech-text-secondary)] leading-relaxed">
              Our AI analyzes financial news, tracks market stories over time, and evaluates sentiment
              patterns. Based on your risk profile, it applies different decision frameworks to generate
              personalized investment recommendations. Each strategy follows a distinct analytical
              process optimized for different risk-return objectives.
            </p>
          </div>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="space-y-6">
        {strategies.map((strategy) => {
          const Icon = strategy.icon;

          return (
            <div
              key={strategy.name}
              className="bg-[var(--fintech-card)] border border-[var(--fintech-border)] rounded-lg overflow-hidden shadow-sm"
            >
              {/* Strategy Header */}
              <div className={`${strategy.bgColor} border-b ${strategy.borderColor} p-6`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${strategy.color}`} />
                  </div>
                  <h2 className={`text-[20px] font-semibold ${strategy.color}`}>
                    {strategy.name}
                  </h2>
                </div>
              </div>

              {/* Strategy Steps */}
              <div className="p-6">
                <div className="space-y-4">
                  {strategy.steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      {/* Step Number */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-[var(--fintech-bg)] rounded-full flex items-center justify-center border border-[var(--fintech-border)]">
                          <span className="text-[14px] font-semibold text-[var(--fintech-text-primary)]">
                            {index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pb-4 border-b border-[var(--fintech-border)] last:border-0 last:pb-0">
                        <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)] mb-2">
                          {step.title}
                        </h3>
                        <p className="text-[14px] text-[var(--fintech-text-secondary)] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="bg-[#EEF2FF] border border-[#BFDBFE] rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-[var(--fintech-accent)] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[16px] font-semibold text-[var(--fintech-text-primary)] mb-2">
              Personalization
            </h3>
            <p className="text-[14px] text-[var(--fintech-text-secondary)] leading-relaxed">
              The AI tailors its recommendations based on your selected risk profile, available capital,
              and investment horizon. You can update your profile at any time to adjust the decision
              logic applied to new analyses. Historical recommendations remain unchanged to maintain
              analytical integrity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
