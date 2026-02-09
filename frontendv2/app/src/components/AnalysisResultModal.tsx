import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AnalysisReport from '@/components/AnalysisReport';

interface AnalysisResultModalProps {
    analysis: any;
    isOpen: boolean;
    onClose: () => void;
    storyTitle?: string;
}

export function AnalysisResultModal({ analysis, isOpen, onClose, storyTitle }: AnalysisResultModalProps) {
    if (!analysis) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#f5f2e9] border-2 border-[#1a1a1a] p-0 gap-0">
                <DialogHeader className="border-b border-[#1a1a1a] p-4">
                    <DialogTitle className="font-serif text-2xl text-[#1a1a1a]">{storyTitle || analysis.story_title || 'Analysis Report'}</DialogTitle>
                    <DialogDescription className="font-serif text-[#6b6b6b]">Generated analysis</DialogDescription>
                </DialogHeader>
                <div className="p-4">
                    <AnalysisReport analysis={analysis} compact={false} />
                </div>
            </DialogContent>
        </Dialog>
    );
}

