import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LargerSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading...',
  className = ''
}) => {
  return (
    <div className="container mt-5">
      <div className={`text-center ${className}`} style={size === 'lg' ? { minHeight: '400px' } : {}}>
        <div className="gap-2 d-flex align-items-center justify-content-center">
          <div className="spinner-grow spinner-grow-lg" role="status" style={{ color: '#fea100' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          {text && size !== 'sm' && (
            <div className="mt-2">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
};

const NormalSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading...',
  className = ''
}) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="gap-2 d-flex align-items-center justify-content-center">
        <div className="spinner-grow spinner-grow-md" role="status" style={{ color: '#fea100' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        {text && size !== 'sm' && (
          <div className="mt-2">{text}</div>
        )}
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}) => {
  return size === 'lg' ? <LargerSpinner size={size} text={text} className={className} /> : <NormalSpinner size={size} text={text} className={className} />;
};
