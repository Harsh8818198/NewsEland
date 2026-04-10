import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignalCard } from '@/components/dashboard/signal-card';

export const dynamic = 'force-dynamic';

export default async function SignalsPage() {
  const { userId } = await auth();

  const { data: signals } = await supabaseAdmin
    .from('signals')
    .select(`
      *,
      news_articles (
        title,
        content,
        source,
        published_at,
        url,
        sentiment_score
      )
    `)
    .eq('user_id', userId!)
    .order('created_at', { ascending: false })
    .limit(50);

  const groupedSignals = {
    today: signals?.filter(s => isToday(new Date(s.created_at))) || [],
    week: signals?.filter(s => isThisWeek(new Date(s.created_at)) && !isToday(new Date(s.created_at))) || [],
    older: signals?.filter(s => !isThisWeek(new Date(s.created_at))) || [],
  };

  const stats = {
    total: signals?.length || 0,
    entry: signals?.filter(s => s.signal_type === 'ENTRY').length || 0,
    exit: signals?.filter(s => s.signal_type === 'EXIT').length || 0,
    hold: signals?.filter(s => s.signal_type === 'HOLD').length || 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trading Signals</h1>
        <p className="text-gray-600 mt-2">
          AI-powered recommendations based on real-time news analysis
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Signals" value={stats.total} color="blue" />
        <StatCard label="Entry" value={stats.entry} color="green" />
        <StatCard label="Exit" value={stats.exit} color="red" />
        <StatCard label="Hold" value={stats.hold} color="yellow" />
      </div>

      {/* Signals List */}
      {signals && signals.length > 0 ? (
        <div className="space-y-8">
          {groupedSignals.today.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Today</h2>
              <div className="space-y-4">
                {groupedSignals.today.map((signal: any) => (
                  <SignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            </div>
          )}

          {groupedSignals.week.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">This Week</h2>
              <div className="space-y-4">
                {groupedSignals.week.map((signal: any) => (
                  <SignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            </div>
          )}

          {groupedSignals.older.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Older</h2>
              <div className="space-y-4">
                {groupedSignals.older.map((signal: any) => (
                  <SignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Signals Yet</CardTitle>
            <CardDescription>
              Add holdings to your portfolio and generate signals to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a 
              href="/dashboard/portfolio"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Go to Portfolio
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorMap[color as keyof typeof colorMap]}`}>
      <div className="text-sm font-medium opacity-80">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}

function isToday(date: Date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isThisWeek(date: Date) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo;
}
