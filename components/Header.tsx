
import React from 'react';
import ThemeToggle from './ui/ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gray-50/80 dark:bg-black/80 backdrop-blur-lg">
      <div className="flex justify-between items-center h-16 px-4 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Synergy</h1>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
