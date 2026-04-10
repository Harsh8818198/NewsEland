import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: portfolio, error } = await supabaseAdmin
      .from('portfolios')
      .select(`
        *,
        holdings (*)
      `)
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch portfolio' 
    }, { status: 500 });
  }
}
