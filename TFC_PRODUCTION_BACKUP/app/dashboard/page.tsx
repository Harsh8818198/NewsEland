import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();

  // Ensure user profile exists in Supabase
  await supabaseAdmin
    .from('user_profiles')
    .upsert({
      id: userId,
      email: user?.emailAddresses[0]?.emailAddress || '',
    }, {
      onConflict: 'id',
      ignoreDuplicates: true
    });

  // Fetch data for your integrated dashboard
  const [portfoliosResult, signalsResult, newsResult] = await Promise.all([
    supabaseAdmin
      .from('portfolios')
      .select(`
        *,
        holdings (*)
      `)
      .eq('user_id', userId),
    
    supabaseAdmin
      .from('signals')
      .select(`
        *,
        news_articles (
          title,
          source,
          published_at,
          sentiment_score,
          url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    
    supabaseAdmin
      .from('news_articles')
      .select('*')
      .eq('processed', true)
      .order('published_at', { ascending: false })
      .limit(30)
  ]);

  return (
    <DashboardClient
      portfolios={portfoliosResult.data || []}
      signals={signalsResult.data || []}
      news={newsResult.data || []}
      user={{
        id: userId,
        firstName: user?.firstName,
        email: user?.emailAddresses[0]?.emailAddress,
      }}
    />
  );
}
