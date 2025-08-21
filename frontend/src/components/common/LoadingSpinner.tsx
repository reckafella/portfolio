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
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  return (
    <div className={`text-center row ${className}`}>
      <div 
        className={`spinner-border text-primary ${sizeClasses[size]}`} 
        role="status"
        aria-hidden="true"
      >
        <span className="visually-hidden">{text}</span>
      </div>
      {text && size !== 'sm' && (
        <div className="mt-2 text-muted">{text}</div>
      )}
    </div>
  );
};
