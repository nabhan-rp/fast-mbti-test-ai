
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-[6px]',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 my-8">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-primary border-t-transparent`}
      ></div>
      {text && <p className="text-content-muted text-lg">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
