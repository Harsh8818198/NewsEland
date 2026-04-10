import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { processWithAIRLMS } from '@/lib/ai/airlms';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('Starting news processing...');

    // Get unprocessed articles
    const { data: articles, error } = await supabaseAdmin
      .from('news_articles')
      .select('*')
      .eq('processed', false)
      .order('published_at', { ascending: false })
      .limit(10); // Process 10 at a time to avoid timeout

    if (error) throw error;

    if (!articles || articles.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'No articles to process',
        processed: 0
      });
    }

    console.log(`Processing ${articles.length} articles...`);
    let processedCount = 0;

    for (const article of articles) {
      try {
        await processArticle(article);
        processedCount++;
      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error);
        // Mark as processed anyway to avoid infinite retry
        await supabaseAdmin
          .from('news_articles')
          .update({ processed: true })
          .eq('id', article.id);
      }
    }

    console.log(`Successfully processed ${processedCount} articles`);

    return NextResponse.json({ 
      success: true, 
      processed: processedCount,
      total: articles.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json({ 
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function processArticle(article: any) {
  const startTime = Date.now();

  try {
    console.log(`Processing: ${article.title}`);

    // Run AIRLMS analysis
    const analysis = await processWithAIRLMS(
      article.title,
      article.content || article.title
    );

    // Update article with analysis
    await supabaseAdmin
      .from('news_articles')
      .update({
        entities: analysis.perception.entities,
        sentiment_score: analysis.analysis.sentiment,
        processed: true
      })
      .eq('id', article.id);

    // Save entities
    for (const entity of analysis.perception.entities) {
      try {
        await supabaseAdmin
          .from('entities')
          .upsert({
            name: entity.name,
            type: entity.type,
            symbol: entity.symbol || null,
            metadata: { 
              relevance: entity.relevance,
              first_seen: new Date().toISOString()
            }
          }, {
            onConflict: 'name,type',
            ignoreDuplicates: true
          });
      } catch (error) {
        console.error('Error saving entity:', error);
      }
    }

    // Save analysis history
    await supabaseAdmin
      .from('analysis_history')
      .insert({
        news_article_id: article.id,
        analysis_type: 'airlms_full',
        input_data: {
          title: article.title,
          content: article.content
        },
        output_data: analysis,
        model_used: 'gemini-1.5-flash',
        processing_time_ms: Date.now() - startTime
      });

    console.log(`✓ Processed: ${article.title}`);
  } catch (error) {
    console.error(`✗ Failed to process article ${article.id}:`, error);
    throw error;
  }
}
