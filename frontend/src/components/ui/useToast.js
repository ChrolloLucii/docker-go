import { useState, useCallback } from 'react';

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, options = {}) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, ...options }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, options.duration || 4000);
  }, []);

  const ToastContainer = useCallback(() => (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{
          marginBottom: 10,
          background: toast.type === 'error' ? '#f87171' : '#222',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          fontWeight: 500,
          minWidth: 220,
        }}>
          {toast.message}
        </div>
      ))}
    </div>
  ), [toasts]);

  return { showToast, ToastContainer };
}
