import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useTheme } from "next-themes";

export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export default function Notification({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}: NotificationProps) {
  const { theme } = useTheme();

  // Auto-close functionality
  React.useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    const baseClasses = theme === 'dark' ? 'text-white' : 'text-gray-900';
    
    switch (type) {
      case 'success':
        return {
          bg: theme === 'dark' 
            ? 'bg-green-500/20 border-green-500/30 backdrop-blur-md' 
            : 'bg-green-50 border-green-200',
          icon: 'text-green-500',
          text: baseClasses
        };
      case 'error':
        return {
          bg: theme === 'dark'
            ? 'bg-red-500/20 border-red-500/30 backdrop-blur-md'
            : 'bg-red-50 border-red-200',
          icon: 'text-red-500',
          text: baseClasses
        };
      case 'warning':
        return {
          bg: theme === 'dark'
            ? 'bg-yellow-500/20 border-yellow-500/30 backdrop-blur-md'
            : 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-500',
          text: baseClasses
        };
      case 'info':
        return {
          bg: theme === 'dark'
            ? 'bg-blue-500/20 border-blue-500/30 backdrop-blur-md'
            : 'bg-blue-50 border-blue-200',
          icon: 'text-blue-500',
          text: baseClasses
        };
      default:
        return {
          bg: theme === 'dark'
            ? 'bg-gray-500/20 border-gray-500/30 backdrop-blur-md'
            : 'bg-gray-50 border-gray-200',
          icon: 'text-gray-500',
          text: baseClasses
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-xl p-4 shadow-lg ${colors.bg}`}
        >
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 ${colors.icon}`}>
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-semibold ${colors.text}`}>
                {title}
              </h4>
              {message && (
                <p className={`text-xs mt-1 ${colors.text} opacity-80`}>
                  {message}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-white/10 text-white/60 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar for auto-close */}
          {autoClose && (
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-1 rounded-b-xl origin-left ${
                type === 'success' ? 'bg-green-500' :
                type === 'error' ? 'bg-red-500' :
                type === 'warning' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook personalizado para gerenciar notificações
export function useNotification() {
  const [notifications, setNotifications] = React.useState<Array<{
    id: string;
    type: NotificationProps['type'];
    title: string;
    message?: string;
    duration?: number;
  }>>([]);

  const showNotification = (
    type: NotificationProps['type'],
    title: string,
    message?: string,
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = { id, type, title, message, duration };
    
    setNotifications(prev => [...prev, notification]);

    // Auto-remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title: string, message?: string) => 
    showNotification('success', title, message);
  
  const showError = (title: string, message?: string) => 
    showNotification('error', title, message);
  
  const showWarning = (title: string, message?: string) => 
    showNotification('warning', title, message);
  
  const showInfo = (title: string, message?: string) => 
    showNotification('info', title, message);

  return {
    notifications,
    showNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}