'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoldingsList } from '@/components/dashboard/holdings-list';
import { SignalCard } from '@/components/dashboard/signal-card';
import { AddHoldingForm } from '@/components/dashboard/add-holding-form';
import { GenerateSignalsButton } from '@/components/dashboard/generate-signals-button';
import { NewsAnalysisPanel } from '@/components/dashboard/news-analysis-panel'; // We'll create this next
import { TrendingUp, PieChart, Activity, Newspaper, BrainCircuit } from 'lucide-react';

interface DashboardClientProps {
  portfolios: any[];
  signals: any[];
  news: any[];
  user: {
    id: string;
    firstName?: string | null;
    email?: string;
  };
}

export default function DashboardClient({ 
  portfolios, 
  signals, 
  news, 
  user 
}: DashboardClientProps) {
  const [activePortfolio, setActivePortfolio] = useState(portfolios[0] || null);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Welcome back, {user.firstName || 'Investor'}
          </h1>
          <p className="text-gray-500 text-lg mt-1 italic">
            "The narrative is the price." — TFC Intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
            <span className="text-sm font-medium text-blue-700">Account status: </span>
            <span className="text-sm font-bold text-blue-800">FREE TIER</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-100/50 p-1 rounded-xl mb-8">
          <TabsTrigger value="overview" className="rounded-lg px-6 py-2">
            <Activity className="w-4 h-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="signals" className="rounded-lg px-6 py-2">
            <BrainCircuit className="w-4 h-4 mr-2" /> AI Signals
          </TabsTrigger>
          <TabsTrigger value="news" className="rounded-lg px-6 py-2">
            <Newspaper className="w-4 h-4 mr-2" /> Narrative Analysis
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="rounded-lg px-6 py-2">
            <PieChart className="w-4 h-4 mr-2" /> Holdings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Stats */}
            <Card className="lg:col-span-2 overflow-hidden border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-100 font-medium">Portfolio Intelligence Score</p>
                    <h2 className="text-6xl font-black mt-2">84.2</h2>
                    <p className="mt-4 text-blue-100 max-w-sm">
                      Your current holdings shows high exposure to tech sector volatility. AI recommends diversification.
                    </p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <TrendingUp className="w-12 h-12" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-gray-100">
              <CardHeader>
                <CardTitle>Portfolio Actions</CardTitle>
                <CardDescription>Direct control over your assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activePortfolio && (
                  <>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Active Portfolio</p>
                      <p className="font-bold text-gray-900">{activePortfolio.name}</p>
                    </div>
                    <GenerateSignalsButton portfolioId={activePortfolio.id} />
                    <AddHoldingForm portfolioId={activePortfolio.id} />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Signals & Graph Preview */}
          <div className="grid lg:grid-cols-2 gap-6">
             <Card className="shadow-lg">
                <CardHeader>
                   <CardTitle>Recent AI Signals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   {signals.slice(0, 3).map(signal => (
                     <SignalCard key={signal.id} signal={signal} />
                   ))}
                </CardContent>
             </Card>
             <Card className="shadow-lg bg-gray-900 border-none text-white overflow-hidden">
                <CardHeader>
                   <CardTitle className="text-white">Narrative Knowledge Graph</CardTitle>
                   <CardDescription className="text-gray-400">Relationship mapping of your entities</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center relative">
                   {/* We'll integrate the Canvas component here in the next step */}
                   <div className="text-center">
                      <BrainCircuit className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-pulse" />
                      <p className="text-gray-400">AI Intelligence Mapping Active</p>
                   </div>
                </CardContent>
             </Card>
          </div>
        </TabsContent>

        {/* Signals Tab */}
        <TabsContent value="signals">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {signals.map(signal => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </TabsContent>

        {/* Narrative Analysis Tab */}
        <TabsContent value="news">
           <NewsAnalysisPanel news={news} />
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio">
           {activePortfolio && (
             <Card className="shadow-lg">
               <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                   <CardTitle>{activePortfolio.name} Holdings</CardTitle>
                   <CardDescription>Current market exposure and AI sentiment</CardDescription>
                 </div>
               </CardHeader>
               <CardContent>
                  <HoldingsList holdings={activePortfolio.holdings} />
               </CardContent>
             </Card>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
