
import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ErrorIcon } from '../icons/ErrorIcon';
import { InfoIcon } from '../icons/InfoIcon';
import { CloseIcon } from '../icons/CloseIcon';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = toastId++;
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000); // Auto-dismiss after 5 seconds
  }, []);

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  const { addToast } = context;

  return useMemo(() => ({
      success: (message: string) => addToast(message, 'success'),
      error: (message: string) => addToast(message, 'error'),
      info: (message: string) => addToast(message, 'info'),
  }), [addToast]);
};

const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: number) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 right-6 z-[100] w-full max-w-sm space-y-3">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const toastIcons: Record<ToastType, React.ReactElement> = {
  success: <CheckCircleIcon completed className="w-6 h-6 text-success-green" />,
  error: <ErrorIcon className="w-6 h-6 text-error-red" />,
  info: <InfoIcon className="w-6 h-6 text-heritage-blue" />,
};

const Toast: React.FC<ToastMessage & { onDismiss: () => void }> = ({ message, type, onDismiss }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="flex items-start w-full p-4 bg-cream rounded-lg shadow-2xl shadow-black/30 ring-1 ring-midnight-navy/10"
    >
      <div className="flex-shrink-0">{toastIcons[type]}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-midnight-navy">{message}</p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button
          onClick={onDismiss}
          className="inline-flex text-midnight-navy/50 rounded-md hover:text-midnight-navy focus:outline-none focus:ring-2 focus:ring-heritage-blue"
        >
          <span className="sr-only">Close</span>
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};
