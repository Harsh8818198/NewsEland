'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function NewsAnalysisPanel({ news }: { news: any[] }) {
  const [selectedArticle, setSelectedArticle] = useState(news[0] || null);

  if (!news || news.length === 0) {
    return (
      <Card className="p-12 text-center text-gray-500">
        <p>No processed news available yet.</p>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[800px]">
      {/* News List */}
      <Card className="lg:col-span-1 overflow-y-auto shadow-lg border-gray-100">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="font-bold text-gray-900">Latest Intelligence</h3>
        </div>
        <div className="divide-y">
          {news.map(article => (
            <div 
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                selectedArticle?.id === article.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
              }`}
            >
              <h4 className="font-bold text-sm leading-tight line-clamp-2 text-gray-800">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-tighter">
                  {article.source}
                </span>
                <span className="text-gray-300 text-[10px]">|</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(article.published_at).toLocaleDateString()}
                </span>
              </div>
              {article.sentiment_score !== null && (
                <div className="mt-3">
                  <SentimentBar score={article.sentiment_score} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Article Detail */}
      <Card className="lg:col-span-2 overflow-y-auto shadow-2xl border-none">
        {selectedArticle ? (
          <div className="p-8 space-y-8 animate-in slide-in-from-right duration-500">
            <div>
              <div className="flex items-center gap-3 mb-4">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                   selectedArticle.sentiment_score > 0.2 ? 'bg-green-100 text-green-700' :
                   selectedArticle.sentiment_score < -0.2 ? 'bg-red-100 text-red-700' :
                   'bg-gray-100 text-gray-700'
                 }`}>
                   {selectedArticle.sentiment_score > 0.2 ? 'BULLISH NARRATIVE' : 
                    selectedArticle.sentiment_score < -0.2 ? 'BEARISH NARRATIVE' : 'NEUTRAL'}
                 </span>
                 <span className="text-sm text-gray-500">Source: {selectedArticle.source}</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">
                {selectedArticle.title}
              </h2>
            </div>

            <div className="prose prose-blue max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedArticle.content}
              </p>
            </div>
            
            {/* Extracted Entities */}
            {selectedArticle.entities && selectedArticle.entities.length > 0 && (
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   Detected Entities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.entities.map((entity: any, i: number) => (
                    <div 
                      key={i}
                      className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-sm font-bold text-gray-800">{entity.name}</span>
                      {entity.symbol && (
                        <span className="text-xs font-medium text-blue-600">({entity.symbol})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedArticle.url && (
              <div className="pt-8 border-t">
                <a 
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Verify Source & Full Report →
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p className="text-lg font-medium">Select an article to deep dive into the narrative</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function SentimentBar({ score }: { score: number }) {
  const percentage = ((score + 1) / 2) * 100;
  const color = score > 0.2 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 
                score < -0.2 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 
                'bg-gray-500 shadow-[0_0_8px_rgba(107,114,128,0.3)]';
  
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div 
        className={`h-1.5 rounded-full transition-all duration-1000 ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
