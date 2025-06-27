
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar'; // Changed to named import
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import DashboardPage from './pages/DashboardPage';
import { useAuth } from './hooks/useAuth';
import { MbtiResult } from './types';

const ResultsPageWrapper: React.FC<{ initialResult: MbtiResult | null, setLatestResult: (result: MbtiResult | null) => void }> = ({ initialResult, setLatestResult }) => {
  const location = useLocation();
  const resultFromState = (location.state as { resultDataFromDashboard?: MbtiResult })?.resultDataFromDashboard;
  const finalResultData = initialResult || resultFromState || (window as any).latestResultForNav;
  
  // Clear the global hack after use
  if ((window as any).latestResultForNav) {
    delete (window as any).latestResultForNav;
  }

  return <ResultsPage resultData={finalResultData} setLatestResult={setLatestResult} />;
};


const App: React.FC = () => {
  const { currentUser } = useAuth();
  const [latestResult, setLatestResult] = React.useState<MbtiResult | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-bground text-content">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage setLatestResult={setLatestResult} />} />
          <Route 
            path="/results" 
            element={<ResultsPageWrapper initialResult={latestResult} setLatestResult={setLatestResult} />} 
          />
          <Route 
            path="/dashboard" 
            element={currentUser ? <DashboardPage latestResult={latestResult} /> : <Navigate to="/" replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
