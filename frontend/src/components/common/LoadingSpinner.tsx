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
      <div className="gap-2 d-flex align-items-center justify-content-center">
        <div className={`spinner-grow spinner-grow-${size}`}
          role="status" style={{color: '#fea100'}}>
          <span className="visually-hidden">{text}</span>
        </div>
        {text && size !== 'sm' && (
          <div className="mt-2">{text}</div>
        )}
      </div>
    </div>
  );
};
