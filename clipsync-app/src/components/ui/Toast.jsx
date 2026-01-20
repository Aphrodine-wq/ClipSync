import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const Toast = ({ id, type, title, message, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const styles = {
    success: {
      bg: 'from-emerald-500/10 to-teal-500/10',
      border: 'border-emerald-500/30',
      icon: 'text-emerald-500',
      progress: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    },
    error: {
      bg: 'from-red-500/10 to-rose-500/10',
      border: 'border-red-500/30',
      icon: 'text-red-500',
      progress: 'bg-gradient-to-r from-red-500 to-rose-500',
    },
    info: {
      bg: 'from-blue-500/10 to-cyan-500/10',
      border: 'border-blue-500/30',
      icon: 'text-blue-500',
      progress: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    },
    warning: {
      bg: 'from-amber-500/10 to-orange-500/10',
      border: 'border-amber-500/30',
      icon: 'text-amber-500',
      progress: 'bg-gradient-to-r from-amber-500 to-orange-500',
    },
  };

  const Icon = icons[type];
  const style = styles[type];

  return (
    <div
      className={`
        relative overflow-hidden
        min-w-[320px] max-w-md
        bg-gradient-to-br ${style.bg}
        backdrop-blur-xl
        border ${style.border}
        rounded-2xl
        shadow-2xl shadow-black/10
        animate-slideInRight
      `}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl" />

      {/* Content */}
      <div className="relative p-4 flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${style.icon}`}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-semibold text-zinc-900 dark:text-white text-sm mb-0.5">
              {title}
            </p>
          )}
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4 text-zinc-400" strokeWidth={2} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-black/5 dark:bg-white/5">
        <div
          className={`h-full ${style.progress} animate-shrinkWidth`}
          style={{ animationDuration: '3000ms' }}
        />
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toast };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, title) => addToast({ type: 'success', message, title }),
    error: (message, title) => addToast({ type: 'error', message, title }),
    info: (message, title) => addToast({ type: 'info', message, title }),
    warning: (message, title) => addToast({ type: 'warning', message, title }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              {...t}
              onClose={() => removeToast(t.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Add animations to index.css
export const toastAnimations = `
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes shrinkWidth {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-slideInRight {
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-shrinkWidth {
  animation: shrinkWidth 3s linear forwards;
}
`;
