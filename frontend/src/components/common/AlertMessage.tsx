import React from 'react';

interface AlertMessageProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  message,
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const alertClass = `alert alert-${type} ${dismissible ? 'alert-dismissible' : ''} ${className}`;
  
  const iconMap = {
    success: 'fas fa-check-circle',
    danger: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle', 
    info: 'fas fa-info-circle'
  };

  return (
    <div className={alertClass} role="alert">
      <i className={`${iconMap[type]} me-2`}></i>
      {message}
      {dismissible && (
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
          onClick={onDismiss}
        ></button>
      )}
    </div>
  );
};
