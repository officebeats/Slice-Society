import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export interface Toast {
  id: number;
  message: string;
  icon?: string; // Material Symbols name
  emoji?: string;
  variant?: 'default' | 'success' | 'reward';
}

interface ToastContextType {
  showToast: (message: string, opts?: Omit<Toast, 'id' | 'message'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, opts?: Omit<Toast, 'id' | 'message'>) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, ...opts }]);
    window.setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast viewport: above the bottom nav on mobile, bottom-right on desktop */}
      <div
        className="fixed z-[5000] bottom-28 md:bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 flex flex-col items-center md:items-end gap-2 pointer-events-none w-[calc(100%-2rem)] max-w-sm"
        role="status"
        aria-live="polite"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full flex items-center gap-3 border-[3px] border-black rounded-2xl px-4 py-3 card-shadow animate-in slide-in-from-bottom-4 fade-in duration-300 ${
              t.variant === 'reward'
                ? 'bg-secondary text-black'
                : t.variant === 'success'
                ? 'bg-rating-high text-white'
                : 'bg-white text-black'
            }`}
          >
            {t.emoji ? (
              <span className="text-2xl leading-none shrink-0">{t.emoji}</span>
            ) : t.icon ? (
              <span className="material-symbols-outlined shrink-0" aria-hidden="true">{t.icon}</span>
            ) : null}
            <span className="font-display text-sm uppercase leading-tight">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
