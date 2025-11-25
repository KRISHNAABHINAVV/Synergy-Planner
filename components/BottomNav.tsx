
import React from 'react';
import { Dashboard } from '../types';
import { NotesIcon, PlannerIcon, HealthIcon } from './Icons';

interface BottomNavProps {
  activeDashboard: Dashboard;
  setActiveDashboard: (dashboard: Dashboard) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  const activeClasses = 'text-orange-500 scale-110';
  const inactiveClasses = 'text-gray-400 dark:text-gray-500';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full transition-all duration-300 ease-in-out transform ${isActive ? activeClasses : inactiveClasses}`}
    >
      <div className={`relative transition-all duration-300 ${isActive ? 'shadow-[0_0_20px_rgba(249,115,22,0.6)] rounded-full' : ''}`}>
        {icon}
      </div>
      <span className={`text-xs mt-1 font-medium ${isActive ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeDashboard, setActiveDashboard }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/70 dark:bg-black/50 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        <NavItem
          icon={<NotesIcon />}
          label="Notes"
          isActive={activeDashboard === Dashboard.Notes}
          onClick={() => setActiveDashboard(Dashboard.Notes)}
        />
        <NavItem
          icon={<PlannerIcon />}
          label="Planner"
          isActive={activeDashboard === Dashboard.Planner}
          onClick={() => setActiveDashboard(Dashboard.Planner)}
        />
        <NavItem
          icon={<HealthIcon />}
          label="Health"
          isActive={activeDashboard === Dashboard.Health}
          onClick={() => setActiveDashboard(Dashboard.Health)}
        />
      </div>
    </div>
  );
};

export default BottomNav;