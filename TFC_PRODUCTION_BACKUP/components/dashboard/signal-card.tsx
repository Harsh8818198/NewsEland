'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

export function SignalCard({ signal }: { signal: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorMap = {
    ENTRY: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-800 border-green-300',
    },
    EXIT: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800 border-red-300',
    },
    HOLD: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    },
  };

  const theme = colorMap[signal.signal_type as keyof typeof colorMap];

  return (
    <Card className={`${theme.border} hover:shadow-md transition-shadow`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold">{signal.symbol}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${theme.badge}`}>
                  {signal.signal_type}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round(signal.confidence * 100)}% confidence
                </span>
              </div>
              
              {/* Reasoning */}
              <p className="text-gray-700 leading-relaxed">{signal.reasoning}</p>
            </div>

            <div className="text-right text-sm text-gray-500 ml-4 whitespace-nowrap">
              {new Date(signal.created_at).toLocaleDateString()}
              <br />
              {new Date(signal.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>

          {/* News Source */}
          {signal.news_articles && (
            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Source:</span> {signal.news_articles.source}
                {signal.news_articles.sentiment_score !== null && (
                  <span className="ml-4">
                    <span className="font-medium">Sentiment:</span>{' '}
                    <SentimentBadge score={signal.news_articles.sentiment_score} />
                  </span>
                )}
              </div>
              
              {signal.news_articles.url && (
                <a
                  href={signal.news_articles.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                >
                  Read original article →
                </a>
              )}
            </div>
          )}

          {/* Expandable Details */}
          {signal.reasoning_layers && (
            <div className="pt-4 border-t">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {isExpanded ? '▼ Hide' : '▶ Show'} AI Reasoning Layers
              </button>
              
              {isExpanded && (
                <div className="mt-4 space-y-3 text-sm">
                  <LayerDetail 
                    title="Perception" 
                    data={signal.reasoning_layers.perception}
                  />
                  <LayerDetail 
                    title="Contextualization" 
                    data={signal.reasoning_layers.contextualization}
                  />
                  <LayerDetail 
                    title="Analysis" 
                    data={signal.reasoning_layers.analysis}
                  />
                  <LayerDetail 
                    title="Synthesis" 
                    data={signal.reasoning_layers.synthesis}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SentimentBadge({ score }: { score: number }) {
  const sentiment = score > 0.2 ? 'Bullish' : score < -0.2 ? 'Bearish' : 'Neutral';
  const color = score > 0.2 ? 'text-green-600' : score < -0.2 ? 'text-red-600' : 'text-gray-600';
  
  return (
    <span className={`font-medium ${color}`}>
      {sentiment} ({score.toFixed(2)})
    </span>
  );
}

function LayerDetail({ title, data }: { title: string; data: any }) {
  return (
    <div className="bg-gray-50 p-3 rounded">
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
