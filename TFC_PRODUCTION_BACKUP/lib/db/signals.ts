import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';

export interface Signal {
  id: string;
  user_id: string;
  symbol: string;
  signal_type: 'ENTRY' | 'EXIT' | 'HOLD';
  confidence: number;
  reasoning: string;
  reasoning_layers?: any;
  news_article_id?: string;
  created_at: string;
  acknowledged: boolean;
  acknowledged_at?: string;
}

export async function getSignalsForUser(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('signals')
    .select(`
      *,
      news_articles (
        title,
        source,
        published_at,
        url,
        sentiment_score
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getUnacknowledgedSignals(userId: string) {
  const { data, error } = await supabase
    .from('signals')
    .select(`
      *,
      news_articles (
        title,
        source,
        published_at,
        url
      )
    `)
    .eq('user_id', userId)
    .eq('acknowledged', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createSignal(
  userId: string,
  symbol: string,
  signalType: 'ENTRY' | 'EXIT' | 'HOLD',
  confidence: number,
  reasoning: string,
  reasoningLayers?: any,
  newsArticleId?: string
) {
  const { data, error } = await supabaseAdmin
    .from('signals')
    .insert({
      user_id: userId,
      symbol: symbol.toUpperCase(),
      signal_type: signalType,
      confidence,
      reasoning,
      reasoning_layers: reasoningLayers,
      news_article_id: newsArticleId
    })
    .select()
    .single();

  if (error) throw error;
  return data as Signal;
}

export async function acknowledgeSignal(signalId: string) {
  const { data, error } = await supabase
    .from('signals')
    .update({
      acknowledged: true,
      acknowledged_at: new Date().toISOString()
    })
    .eq('id', signalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSignalsForSymbol(symbol: string, limit = 10) {
  const { data, error } = await supabaseAdmin
    .from('signals')
    .select('*')
    .eq('symbol', symbol.toUpperCase())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
