
import React, { useState } from 'react';
import DietPlanner from './DietPlanner';
import WorkoutPlanner from './WorkoutPlanner';

type HealthTab = 'diet' | 'workout';

const HealthDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HealthTab>('workout');

  const TabButton: React.FC<{ tab: HealthTab; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
        activeTab === tab 
          ? 'bg-orange-500 text-white shadow-md' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-2 pb-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Suite</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your wellness journey</p>
        </header>

        <div className="bg-gray-200 dark:bg-white/10 p-1 rounded-full flex gap-1">
          <TabButton tab="diet" label="Diet" />
          <TabButton tab="workout" label="Workout" />
        </div>
      </div>

      <div className="flex-grow">
        {activeTab === 'diet' ? (
          <div className="px-6">
            <DietPlanner />
          </div>
        ) : (
          <WorkoutPlanner />
        )}
      </div>
    </div>
  );
};

export default HealthDashboard;
