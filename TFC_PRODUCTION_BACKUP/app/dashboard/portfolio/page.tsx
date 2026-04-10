import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddPortfolioForm } from '@/components/dashboard/add-portfolio-form';
import { AddHoldingForm } from '@/components/dashboard/add-holding-form';
import { HoldingsList } from '@/components/dashboard/holdings-list';
import { GenerateSignalsButton } from '@/components/dashboard/generate-signals-button';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
  const { userId } = await auth();

  const { data: portfolios } = await supabaseAdmin
    .from('portfolios')
    .select(`
      *,
      holdings (*)
    `)
    .eq('user_id', userId!)
    .order('created_at', { ascending: false });

  const hasPortfolios = portfolios && portfolios.length > 0;
  const defaultPortfolio = portfolios?.find(p => p.is_default) || portfolios?.[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Management</h1>
          <p className="text-gray-600 mt-2">
            Track your holdings and receive AI-powered signals
          </p>
        </div>
        {hasPortfolios && <AddPortfolioForm />}
      </div>

      {/* No Portfolios State */}
      {!hasPortfolios && (
        <Card>
          <CardHeader>
            <CardTitle>Create Your First Portfolio</CardTitle>
            <CardDescription>
              Start tracking stocks and get personalized AI signals based on breaking news
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddPortfolioForm />
          </CardContent>
        </Card>
      )}

      {/* Portfolios List */}
      {hasPortfolios && (
        <div className="space-y-6">
          {portfolios?.map((portfolio: any) => (
            <Card key={portfolio.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{portfolio.name}</CardTitle>
                    {portfolio.description && (
                      <CardDescription>{portfolio.description}</CardDescription>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>{portfolio.holdings?.length || 0} holdings</span>
                      {portfolio.is_default && (
                        <span className="text-blue-600 font-medium">Default</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <AddHoldingForm portfolioId={portfolio.id} />
                    <GenerateSignalsButton portfolioId={portfolio.id} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <HoldingsList holdings={portfolio.holdings || []} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Free Tier Limit Notice */}
      {hasPortfolios && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-semibold text-blue-900">Free Tier Limits</h3>
                <p className="text-sm text-blue-800 mt-1">
                  You can track up to 10 holdings total. Upgrade to Pro for unlimited holdings,
                  real-time alerts, and advanced analytics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
