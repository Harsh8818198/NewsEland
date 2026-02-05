import { useState } from 'react';
import { Sidebar } from './components/investment/Sidebar';
import { Navbar } from './components/investment/Navbar';
import { DashboardPage } from './components/investment/pages/DashboardPage';
import { StoriesFeedPage } from './components/investment/pages/StoriesFeedPage';
import { AnalyzerPage } from './components/investment/pages/AnalyzerPage';
import { ProfilePage } from './components/investment/pages/ProfilePage';
import { DecisionLogicPage } from './components/investment/pages/DecisionLogicPage';
import { SystemStatusPage } from './components/investment/pages/SystemStatusPage';
import { StoryDetailsModal } from './components/investment/StoryDetailsModal';
import { getStoryById } from './data/investmentMockData';
import { ApiProvider } from './services/apiContext';

type Page =
  | 'dashboard'
  | 'stories'
  | 'analyzer'
  | 'profile'
  | 'decision-logic'
  | 'system-status';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleStoryClick = (storyId: string) => {
    setSelectedStoryId(storyId);
  };

  const handleCloseStoryModal = () => {
    setSelectedStoryId(null);
  };

  const selectedStory = selectedStoryId ? getStoryById(selectedStoryId) : null;

  return (
    <ApiProvider>
      <div className="min-h-screen bg-[var(--fintech-bg)]">
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

        {/* Main Content Area */}
        <div className="ml-64 pt-16">
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <div className="p-8">
            {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
            {currentPage === 'stories' && <StoriesFeedPage onStoryClick={handleStoryClick} />}
            {currentPage === 'analyzer' && <AnalyzerPage />}
            {currentPage === 'profile' && <ProfilePage />}
            {currentPage === 'decision-logic' && <DecisionLogicPage />}
            {currentPage === 'system-status' && <SystemStatusPage />}
          </div>
        </div>

        {/* Story Details Modal */}
        {selectedStory && (
          <StoryDetailsModal story={selectedStory} onClose={handleCloseStoryModal} />
        )}
      </div>
    </ApiProvider>
  );
}
