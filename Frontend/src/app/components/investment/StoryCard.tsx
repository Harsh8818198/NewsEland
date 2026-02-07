import { Story, AnalysisResult } from '@/app/types/investment';
import { Clock, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApiContext } from '@/app/services/apiContext';
import { AnalysisResultModal } from './AnalysisResultModal';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  const { actions, analysis } = useApiContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Use the topic as the primary category tag
  const category = story.topic;
  // Use the hypothesis 'what' as the lead summary, fallback to story summary
  const summary = story.currentHypothesis?.what || story.summary;

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsAnalyzing(true);
    try {
      await actions.analyzeStory(story);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Watch for new analysis results
  useEffect(() => {
    if (!isAnalyzing && analysis.results.length > 0) {
      const latestResult = analysis.results[0];
      // Check if this is a new result (within last 2 seconds)
      const resultTime = new Date(latestResult.timestamp).getTime();
      const now = Date.now();
      if (now - resultTime < 2000) {
        setAnalysisResult(latestResult);
        setShowAnalysisResult(true);
      }
    }
  }, [analysis.results, isAnalyzing]);

  return (
    <>
      <div
        onClick={onClick}
        className="group cursor-pointer border-b border-[#e5e3df] py-6 last:border-0 hover:bg-[#faf9f6]/50 transition-colors px-2"
      >
        <div className="flex flex-col gap-2">
          {/* Meta Header */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#d4af37]">
              {category}
            </span>
            <span className="text-[11px] text-[#9ca3af] font-serif flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {story.lastUpdated}
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-xl md:text-2xl font-serif text-[#1a1a1a] leading-tight group-hover:text-[#2c3e50] transition-colors font-medium">
            {story.title}
          </h3>

          {/* Lead/Hypothesis */}
          <p className="text-[15px] leading-relaxed text-[#4b5563] font-serif line-clamp-2 mt-1">
            {summary}
          </p>

          {/* Footer (Read More + Analyze) */}
          <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs font-semibold text-[#2c3e50] uppercase tracking-wide border-b border-[#2c3e50]">
              Read Full Briefing
            </span>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#d4af37] uppercase tracking-wide hover:text-[#b8941f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Analyze this story"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>
      {showAnalysisResult && analysisResult !== null && (
        <AnalysisResultModal
          analysis={analysisResult}
          onClose={() => setShowAnalysisResult(false)}
        />
      )}
    </>
  );
}
