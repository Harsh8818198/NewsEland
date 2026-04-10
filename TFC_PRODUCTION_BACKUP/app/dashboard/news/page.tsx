import { supabaseAdmin } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const { data: news } = await supabaseAdmin
    .from('news_articles')
    .select('*')
    .eq('processed', true)
    .order('published_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial News Feed</h1>
        <p className="text-gray-600 mt-2">
          Real-time business news analyzed by our AI engine
        </p>
      </div>

      {/* News Grid */}
      {news && news.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {news.map((article: any) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p className="text-lg">No news articles yet</p>
            <p className="text-sm mt-2">News will appear here once the ingestion cron runs</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NewsCard({ article }: { article: any }) {
  const sentimentColor = 
    article.sentiment_score > 0.2 ? 'text-green-600' : 
    article.sentiment_score < -0.2 ? 'text-red-600' : 
    'text-gray-600';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-lg font-semibold leading-tight hover:text-blue-600">
            {article.url ? (
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
            ) : (
              article.title
            )}
          </h3>

          {/* Content */}
          {article.content && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {article.content}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span>{article.source}</span>
            <span>•</span>
            <span>{new Date(article.published_at).toLocaleDateString()}</span>
            {article.sentiment_score !== null && (
              <>
                <span>•</span>
                <span className={sentimentColor}>
                  Sentiment: {article.sentiment_score.toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Entities */}
          {article.entities && article.entities.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {article.entities.slice(0, 5).map((entity: any, i: number) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                >
                  {entity.symbol || entity.name}
                </span>
              ))}
              {article.entities.length > 5 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                  +{article.entities.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
