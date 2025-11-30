import { useState, useCallback } from 'react';
import type { ToastMessage } from '@/components/common/Toast';

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: ToastMessage = { id, message, type };
        setToasts((prev) => [...prev, newToast]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return {
        toasts,
        showToast,
        removeToast,
    };
};
