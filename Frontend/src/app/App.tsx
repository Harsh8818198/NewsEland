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
import type { Story } from './types/investment';
import { ApiProvider, useApiContext } from './services/apiContext';

type Page =
  | 'dashboard'
  | 'stories'
  | 'analyzer'
  | 'profile'
  | 'decision-logic'
  | 'system-status';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const { stories, actions: { refreshNews } } = useApiContext();

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleStoryClick = (storyId: string) => {
    const story = stories.data.find((s) => s.id === storyId);
    if (story) {
      setSelectedStory(story);
    }
  };

  const handleCloseStoryModal = () => {
    setSelectedStory(null);
  };

  const handleRefreshNews = async () => {
    try {
      await refreshNews();
      alert('News refresh started successfully.');
    } catch (error) {
      console.error('Failed to refresh news:', error);
      alert('Failed to refresh news. Please try again.');
    }
  };

  return (
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

        {/* Refresh News Button */}
        <button onClick={handleRefreshNews} className="btn btn-primary">
          Refresh News
        </button>
      </div>

      {/* Story Details Modal */}
      {selectedStory && (
        <StoryDetailsModal story={selectedStory} onClose={handleCloseStoryModal} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ApiProvider>
      <AppContent />
    </ApiProvider>
  );
}
