
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'secondary', className = '', ...props }) => {
  const baseClasses = 'px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-orange-500 text-white shadow-[0_4px_15px_rgba(249,115,22,0.4)] hover:bg-orange-600',
    secondary: 'bg-gray-200/80 dark:bg-white/10 backdrop-blur-sm border border-black/10 dark:border-white/20 text-gray-800 dark:text-white hover:bg-gray-300/80 dark:hover:bg-white/20',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;