import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Toast Context for global toast management
 */
const ToastContext = createContext(null);

/**
 * Toast Provider Component
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
    
    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
    
    return id;
  }, []);
  
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  const toast = useCallback({
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
    custom: (message, options = {}) => addToast({ type: 'custom', message, ...options }),
  }, [addToast]);
  
  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Toast Container Component
 */
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

/**
 * Individual Toast Component
 */
const Toast = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);
  
  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 200);
  };
  
  // Type configurations
  const typeConfig = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      iconColor: 'text-emerald-500',
      textColor: 'text-emerald-800',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-500',
      textColor: 'text-red-800',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconColor: 'text-amber-500',
      textColor: 'text-amber-800',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-800',
    },
    custom: {
      icon: null,
      bg: 'bg-white',
      border: 'border-zinc-200',
      iconColor: 'text-zinc-500',
      textColor: 'text-zinc-800',
    },
  };
  
  const config = typeConfig[toast.type] || typeConfig.info;
  const Icon = toast.icon || config.icon;
  
  return (
    <div
      className={`
        pointer-events-auto
        flex items-start gap-3
        p-4 rounded-xl
        border shadow-lg
        transition-all duration-200 ease-out
        ${config.bg} ${config.border}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      {/* Icon */}
      {Icon && (
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} strokeWidth={2} />
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`font-semibold ${config.textColor}`}>{toast.title}</p>
        )}
        <p className={`text-sm ${config.textColor} ${toast.title ? 'mt-0.5' : ''}`}>
          {toast.message}
        </p>
        
        {/* Action Button */}
        {toast.action && (
          <button
            onClick={() => {
              toast.action.onClick();
              handleClose();
            }}
            className={`mt-2 text-sm font-medium ${config.iconColor} hover:underline`}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className={`p-1 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0`}
      >
        <X className="w-4 h-4 text-zinc-400" strokeWidth={2} />
      </button>
    </div>
  );
};

export default Toast;
