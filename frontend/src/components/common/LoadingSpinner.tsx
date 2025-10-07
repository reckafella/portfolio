import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="gap-2 d-flex align-items-center justify-content-center h-100 m-auto">
        <div className="spinner-grow text-success" role="status">
          <span className="visually-hidden">{text}</span>
        </div>
        {text && size !== 'sm' && (
          <div className="mt-2">{text}</div>
        )}
      </div>
    </div>
  );
};
