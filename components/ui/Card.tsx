
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white/50 dark:bg-white/5 backdrop-blur-lg border border-black/5 dark:border-white/10 rounded-2xl p-4 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;