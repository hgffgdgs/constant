import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Chargement...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className={`animate-spin rounded-full border-4 border-gray-700 border-t-tamboura-500 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-gray-400 text-sm">{text}</p>
      )}
    </div>
  );
};