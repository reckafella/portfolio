import React, { useEffect } from 'react';
import '@/styles/Toast.css';

// Import Bootstrap Toast dynamically to avoid type issues
declare const bootstrap: any;

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
    useEffect(() => {
        // Initialize Bootstrap toasts
        if (typeof bootstrap !== 'undefined') {
            toasts.forEach((toast) => {
                const toastElement = document.getElementById(`toast-${toast.id}`);
                if (toastElement) {
                    const bsToast = new bootstrap.Toast(toastElement, {
                        autohide: true,
                        delay: 1000,
                    });
                    bsToast.show();

                    // Remove toast after it's hidden
                    toastElement.addEventListener('hidden.bs.toast', () => {
                        onRemove(toast.id);
                    });
                }
            });
        }
    }, [toasts, onRemove]);

    const getToastClass = (type: string) => {
        const classes: Record<string, string> = {
            success: 'bg-success',
            error: 'bg-danger',
            warning: 'bg-warning',
            info: 'bg-info',
        };
        return classes[type] || classes.info;
    };

    const getToastIcon = (type: string) => {
        const icons: Record<string, string> = {
            success: 'bi-check-circle',
            error: 'bi-x-circle',
            warning: 'bi-exclamation-triangle',
            info: 'bi-info-circle',
        };
        return icons[type] || icons.info;
    };

    return (
        <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 11000 }}>
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    id={`toast-${toast.id}`}
                    className={`toast ${getToastClass(toast.type)} text-white`}
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                >
                    <div className="toast-header">
                        <i className={`bi ${getToastIcon(toast.type)} me-2`}></i>
                        <strong className="me-auto">
                            {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
                        </strong>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="toast"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="toast-body">{toast.message}</div>
                </div>
            ))}
        </div>
    );
};

export default Toast;
