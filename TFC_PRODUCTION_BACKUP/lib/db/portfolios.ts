import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Holding {
  id: string;
  portfolio_id: string;
  symbol: string;
  company_name?: string;
  quantity?: number;
  purchase_price?: number;
  purchase_date?: string;
  created_at: string;
  updated_at: string;
}

export async function createPortfolio(userId: string, name: string, description?: string) {
  const { data, error } = await supabase
    .from('portfolios')
    .insert({ 
      user_id: userId, 
      name, 
      description,
      is_default: true 
    })
    .select()
    .single();

  if (error) throw error;
  return data as Portfolio;
}

export async function getPortfolios(userId: string) {
  const { data, error } = await supabase
    .from('portfolios')
    .select(`
      *,
      holdings (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPortfolioById(portfolioId: string) {
  const { data, error } = await supabase
    .from('portfolios')
    .select(`
      *,
      holdings (*)
    `)
    .eq('id', portfolioId)
    .single();

  if (error) throw error;
  return data;
}

export async function addHolding(
  portfolioId: string,
  symbol: string,
  companyName?: string,
  quantity?: number,
  purchasePrice?: number
) {
  const { data, error } = await supabase
    .from('holdings')
    .insert({
      portfolio_id: portfolioId,
      symbol: symbol.toUpperCase(),
      company_name: companyName,
      quantity,
      purchase_price: purchasePrice,
      purchase_date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  if (error) throw error;
  return data as Holding;
}

export async function removeHolding(holdingId: string) {
  const { error } = await supabase
    .from('holdings')
    .delete()
    .eq('id', holdingId);

  if (error) throw error;
}

export async function updateHolding(
  holdingId: string,
  updates: Partial<Holding>
) {
  const { data, error } = await supabase
    .from('holdings')
    .update(updates)
    .eq('id', holdingId)
    .select()
    .single();

  if (error) throw error;
  return data as Holding;
}

// Server-side functions (use supabaseAdmin)
export async function getHoldingsForUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('holdings')
    .select(`
      *,
      portfolios!inner (
        user_id
      )
    `)
    .eq('portfolios.user_id', userId);

  if (error) throw error;
  return data;
}
