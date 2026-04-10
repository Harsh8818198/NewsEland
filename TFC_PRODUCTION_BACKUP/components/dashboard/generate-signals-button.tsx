'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function GenerateSignalsButton({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Get holdings for this portfolio
      const response = await fetch(`/api/portfolio?id=${portfolioId}`);
      const { portfolio } = await response.json();

      if (!portfolio?.holdings || portfolio.holdings.length === 0) {
        alert('Add holdings to this portfolio first');
        return;
      }

      // Generate signals for each holding
      const promises = portfolio.holdings.map((holding: any) =>
        fetch('/api/signals/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: holding.symbol, portfolioId }),
        })
      );

      await Promise.all(promises);

      alert('Signals generated! Check the Signals page.');
      router.push('/dashboard/signals');
    } catch (error) {
      console.error('Error generating signals:', error);
      alert('Failed to generate signals');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      variant="default"
      size="sm"
    >
      {isGenerating ? 'Generating...' : '⚡ Generate Signals'}
    </Button>
  );
}
