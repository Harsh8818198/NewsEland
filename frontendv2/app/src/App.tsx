import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Stories } from '@/pages/Stories';
import StoryDetail from '@/pages/StoryDetail';
import { Analyses } from '@/pages/Analyses';
import { Analyzer } from '@/pages/Analyzer';
import { SystemStatus } from '@/pages/SystemStatus';
import { Profile } from '@/pages/Profile';
import { Portfolio } from '@/pages/Portfolio';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:id" element={<StoryDetail />} />
          <Route path="/analyses" element={<Analyses />} />
          <Route path="/analyzer" element={<Analyzer />} />
          <Route path="/system" element={<SystemStatus />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
