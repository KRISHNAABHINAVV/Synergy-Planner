
import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import NotesDashboard from './components/notes/NotesDashboard';
import PlannerDashboard from './components/planner/PlannerDashboard';
import HealthDashboard from './components/health/HealthDashboard';
import { Dashboard } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';

const AppContent: React.FC = () => {
  const [activeDashboard, setActiveDashboard] = useState<Dashboard>(Dashboard.Planner);

  const renderDashboard = () => {
    switch (activeDashboard) {
      case Dashboard.Notes:
        return <NotesDashboard />;
      case Dashboard.Planner:
        return <PlannerDashboard />;
      case Dashboard.Health:
        return <HealthDashboard />;
      default:
        return <PlannerDashboard />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen text-gray-800 dark:text-gray-300 font-sans">
      <Header />
      <div className="pt-16 pb-24">
        {renderDashboard()}
      </div>
      <BottomNav activeDashboard={activeDashboard} setActiveDashboard={setActiveDashboard} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;