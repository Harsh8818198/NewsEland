import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateSignalForHolding } from '@/lib/ai/airlms';
import { createSignal } from '@/lib/db/signals';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, portfolioId } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
    }

    // Get recent news for this symbol
    const { data: newsArticles } = await supabaseAdmin
      .from('news_articles')
      .select('title, content, sentiment_score, published_at')
      .contains('entities', [{ symbol: symbol.toUpperCase() }])
      .order('published_at', { ascending: false })
      .limit(5);

    if (!newsArticles || newsArticles.length === 0) {
      return NextResponse.json({ 
        message: 'No recent news found for this symbol',
        signal: null
      });
    }

    // Generate signal
    const signalData = await generateSignalForHolding(symbol, newsArticles);

    // Save signal to database
    const signal = await createSignal(
      userId,
      symbol,
      signalData.signal,
      signalData.confidence,
      signalData.reasoning
    );

    return NextResponse.json({ 
      success: true,
      signal 
    });

  } catch (error) {
    console.error('Signal generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate signal',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Batch generate signals for all user holdings
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('Starting batch signal generation...');

    // Get all users with holdings
    const { data: holdings } = await supabaseAdmin
      .from('holdings')
      .select(`
        symbol,
        portfolios!inner (
          user_id
        )
      `);

    if (!holdings || holdings.length === 0) {
      return NextResponse.json({ 
        message: 'No holdings to process',
        generated: 0
      });
    }

    // Group by user and symbol
    const userSymbols = new Map<string, Set<string>>();
    
    for (const holding of holdings) {
      const userId = (holding.portfolios as any).user_id;
      if (!userSymbols.has(userId)) {
        userSymbols.set(userId, new Set());
      }
      userSymbols.get(userId)!.add(holding.symbol);
    }

    let generatedCount = 0;

    // Generate signals for each user's holdings
    for (const [userId, symbols] of userSymbols.entries()) {
      for (const symbol of symbols) {
        try {
          // Get recent news
          const { data: newsArticles } = await supabaseAdmin
            .from('news_articles')
            .select('title, content, sentiment_score, id')
            .contains('entities', [{ symbol: symbol }])
            .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('published_at', { ascending: false })
            .limit(5);

          if (newsArticles && newsArticles.length > 0) {
            const signalData = await generateSignalForHolding(symbol, newsArticles);
            
            await createSignal(
              userId,
              symbol,
              signalData.signal,
              signalData.confidence,
              signalData.reasoning,
              undefined,
              newsArticles[0].id
            );

            generatedCount++;
          }
        } catch (error) {
          console.error(`Error generating signal for ${symbol}:`, error);
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      generated: generatedCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch signal generation error:', error);
    return NextResponse.json({ 
      error: 'Batch generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
