import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();

  // If logged in, redirect to dashboard immediately
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">T</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Financial Chronicle</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/sign-in" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Sign In
          </Link>
          <Link 
            href="/sign-up" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
              ⚡ Now powered by AIRLMS reasoning
            </div>
            <h1 className="text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Invest with <span className="text-blue-600">Narrative Intelligence.</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              The Financial Chronicle (TFC) uses 5-layer AI reasoning to transform raw news into actionable trading signals for your portfolio.
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href="/sign-up" 
                className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all transform hover:scale-105"
              >
                Start Trading Smarter
              </Link>
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"></div>
                ))}
                <div className="pl-6 text-sm text-gray-500 font-medium">
                  Joined by 2,000+ investors
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-100 rounded-3xl blur-2xl opacity-30"></div>
            <div className="relative bg-white border border-gray-100 rounded-2xl shadow-2xl p-8 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <span className="font-bold">Latest Alpha Signals</span>
                <span className="text-green-500 text-sm font-medium">● System Live</span>
              </div>
              {[
                { symbol: 'AAPL', signal: 'ENTRY', reason: 'Anticipated supply chain recovery in Q3' },
                { symbol: 'NVDA', signal: 'HOLD', reason: 'Maintaining strength post-earnings' },
                { symbol: 'TSLA', signal: 'EXIT', reason: 'Regulatory headwinds in EU markets' }
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-bold">{s.symbol}</div>
                    <div className="text-xs text-gray-500">{s.reason}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    s.signal === 'ENTRY' ? 'bg-green-100 text-green-700' :
                    s.signal === 'HOLD' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {s.signal}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          <FeatureCard 
            title="Reasoning Engine" 
            desc="Goes beyond sentiment. Our AIRLMS engine analyzes market context, sector trends, and historical parallels."
          />
          <FeatureCard 
            title="Portfolio Tracking" 
            desc="Add your holdings and receive personalized signals tailored to your specific investment strategy."
          />
          <FeatureCard 
            title="Real-time News" 
            desc="Direct integration with global financial news wires, processed in seconds by our AI layer."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 mt-20">
        <div className="max-w-7xl mx-auto px-8 text-center text-gray-500 text-sm">
          © 2026 The Financial Chronicle. All rights reserved. Built for professional investors.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-8 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all">
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
