import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Ensure user profile exists
  await supabaseAdmin
    .from('user_profiles')
    .upsert({
      id: userId,
      email: '', // Will be updated on first login
    }, {
      onConflict: 'id',
      ignoreDuplicates: true
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold hidden sm:block">TFC</span>
              </Link>
              
              <div className="hidden md:flex gap-6">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/dashboard/portfolio">Portfolio</NavLink>
                <NavLink href="/dashboard/signals">Signals</NavLink>
                <NavLink href="/dashboard/news">News Feed</NavLink>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                Free Tier
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
    >
      {children}
    </Link>
  );
}
