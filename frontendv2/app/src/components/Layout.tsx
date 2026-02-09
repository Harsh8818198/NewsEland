import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Front Page', href: '/dashboard' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Stories', href: '/stories' },
  { name: 'Analyzer', href: '/analyzer' },
  { name: 'Report Log', href: '/analyses' },
  { name: 'System', href: '/system' },
  { name: 'Profile', href: '/profile' },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isActive = (path: string) => location.pathname === path;

  // Keep-alive ping for backend
  useEffect(() => {
    const pingBackend = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        await fetch(`${apiUrl}/api/health`);
        console.log('Backend ping successful');
      } catch (error) {
        console.error('Backend ping failed:', error);
      }
    };

    // Initial ping
    pingBackend();

    // Set up interval for every 60 seconds
    const intervalId = setInterval(pingBackend, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f2e9]">
      {/* Masthead */}
      <header className="border-b-4 border-double border-[#1a1a1a] pb-4 pt-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Top bar with date and edition */}
          <div className="flex justify-between items-center text-xs uppercase tracking-widest text-[#6b6b6b] mb-4 font-serif">
            <span>Vol. CXXIV • No. 42</span>
            <span>{currentDate}</span>
            <span>Price: Free</span>
          </div>

          {/* Main Masthead */}
          <div className="text-center">
            <Link to="/dashboard" className="block">
              <h1 className="masthead-title text-[#1a1a1a] hover:opacity-80 transition-opacity">
                The Financial Chronicle
              </h1>
            </Link>
            <p className="masthead-subtitle">
              AI-Powered Investment Intelligence & Market Analysis
            </p>
            <p className="masthead-date mt-2">
              &ldquo;Illuminating Markets Through Artificial Intelligence&rdquo;
            </p>
          </div>

          {/* Navigation */}
          <nav className="mt-6 pt-4 border-t border-[#1a1a1a]">
            {/* Desktop Navigation */}
            <ul className="hidden md:flex justify-center items-center gap-8 nav-newspaper">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      relative py-2 px-1 transition-colors
                      ${isActive(item.href)
                        ? 'text-[#1a1a1a] font-bold'
                        : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
                      }
                    `}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a1a1a]" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile Navigation */}
            <div className="md:hidden flex justify-between items-center">
              <span className="nav-newspaper text-[#4a4a4a]">
                {navigation.find(n => isActive(n.href))?.name || 'Front Page'}
              </span>
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-[#1a1a1a]">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="bg-[#f5f2e9] border-b-2 border-[#1a1a1a]">
                  <div className="flex flex-col items-center py-8">
                    <h2 className="masthead-title text-2xl mb-6">The Financial Chronicle</h2>
                    <nav className="flex flex-col items-center gap-4 nav-newspaper">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`
                            py-2 text-lg
                            ${isActive(item.href)
                              ? 'text-[#1a1a1a] font-bold border-b-2 border-[#1a1a1a]'
                              : 'text-[#4a4a4a]'
                            }
                          `}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#1a1a1a] mt-12 py-8 px-4 bg-[#ede8d8]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-serif font-bold text-lg mb-2">The Financial Chronicle</h3>
              <p className="text-sm text-[#6b6b6b] font-serif">
                AI-powered investment intelligence platform providing real-time market analysis and portfolio management.
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-serif font-bold uppercase tracking-wider text-sm mb-3">Sections</h4>
              <ul className="space-y-1 text-sm font-serif">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-[#4a4a4a] hover:text-[#1a1a1a] hover:underline">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center md:text-right">
              <h4 className="font-serif font-bold uppercase tracking-wider text-sm mb-3">Edition</h4>
              <p className="text-sm text-[#6b6b6b] font-serif">
                {currentDate}<br />
                Digital Edition<br />
                All Rights Reserved
              </p>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-[#1a1a1a] text-center">
            <p className="text-xs text-[#6b6b6b] font-serif uppercase tracking-wider">
              &copy; {new Date().getFullYear()} The Financial Chronicle • Printed on Digital Paper
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
