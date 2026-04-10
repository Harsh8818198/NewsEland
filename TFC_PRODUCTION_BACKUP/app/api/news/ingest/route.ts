import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    // Verify cron secret for production
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('Starting news ingestion...');
    const articles = await fetchNews();
    console.log(`Fetched ${articles.length} articles`);
    
    const saved = await saveArticles(articles);
    console.log(`Saved ${saved.length} new articles`);

    return NextResponse.json({ 
      success: true, 
      totalFetched: articles.length,
      newArticles: saved.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('News ingestion error:', error);
    return NextResponse.json({ 
      error: 'Ingestion failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function fetchNews() {
  const articles: any[] = [];

  // NewsAPI - Business headlines
  if (NEWS_API_KEY) {
    try {
      const newsApiResponse = await fetch(
        `https://newsapi.org/v2/top-headlines?category=business&country=us&pageSize=50&apiKey=${NEWS_API_KEY}`,
        { next: { revalidate: 0 } }
      );
      const newsApiData = await newsApiResponse.json();
      
      if (newsApiData.articles) {
        articles.push(...newsApiData.articles.map((a: any) => ({
          title: a.title,
          content: a.description || a.content || '',
          url: a.url,
          source: a.source?.name || 'NewsAPI',
          published_at: a.publishedAt,
          image_url: a.urlToImage
        })));
      }
    } catch (error) {
      console.error('NewsAPI error:', error);
    }
  }

  // GNews API
  if (GNEWS_API_KEY) {
    try {
      const gnewsResponse = await fetch(
        `https://gnews.io/api/v4/top-headlines?category=business&lang=en&max=50&token=${GNEWS_API_KEY}`,
        { next: { revalidate: 0 } }
      );
      const gnewsData = await gnewsResponse.json();
      
      if (gnewsData.articles) {
        articles.push(...gnewsData.articles.map((a: any) => ({
          title: a.title,
          content: a.description || a.content || '',
          url: a.url,
          source: a.source?.name || 'GNews',
          published_at: a.publishedAt,
          image_url: a.image
        })));
      }
    } catch (error) {
      console.error('GNews error:', error);
    }
  }

  // Filter out invalid articles
  return articles.filter(a => 
    a.title && 
    a.url && 
    a.title !== '[Removed]' &&
    !a.title.includes('removed')
  );
}

async function saveArticles(articles: any[]) {
  const saved = [];

  for (const article of articles) {
    try {
      // Check if article already exists
      const { data: existing } = await supabaseAdmin
        .from('news_articles')
        .select('id')
        .eq('url', article.url)
        .single();

      if (existing) {
        continue; // Skip duplicates
      }

      const { data, error } = await supabaseAdmin
        .from('news_articles')
        .insert({
          title: article.title,
          content: article.content,
          url: article.url,
          source: article.source,
          published_at: article.published_at,
          image_url: article.image_url,
          processed: false
        })
        .select()
        .single();

      if (data) saved.push(data);
      if (error) console.error('Error saving article:', error);
    } catch (error) {
      console.error('Error processing article:', error);
    }
  }

  return saved;
}
