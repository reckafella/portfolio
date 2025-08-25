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
        <div className="spinner-grow spinner-grow-sm text-light" role="status">
          <span className="visually-hidden">{text}</span>
        </div>
        <div className="spinner-grow text-info" role="status"
        style={{width: "20px", height: "20px"}}>
          <span className="visually-hidden">{text}</span>
        </div>
        <div className="spinner-grow text-warning" role="status"
        style={{width: "25px", height: "25px"}}>
          <span className="visually-hidden">{text}</span>
        </div>
        <div className="spinner-grow text-danger" role="status"
        style={{width: "30px", height: "30px"}}>
          <span className="visually-hidden">{text}</span>
        </div>
        <div className="spinner-grow text-primary" role="status"
        style={{width: "35px", height: "35px"}}>
          <span className="visually-hidden">{text}</span>
        </div>
        <div className="spinner-grow text-success" role="status"
        style={{width: "40px", height: "40px"}}>
          <span className="visually-hidden">{text}</span>
        </div>
      </div>
      {text && size !== 'sm' && (
        <div className="mt-2 text-muted">{text}</div>
      )}
    </div>
  );
};
