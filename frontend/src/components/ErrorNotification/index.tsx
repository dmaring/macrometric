/**
 * ErrorNotification Component
 *
 * Displays error notifications for API failures, offline status, etc.
 * Auto-dismisses after a timeout or can be manually dismissed.
 */
import React, { useEffect, useState } from 'react';

export interface ErrorNotificationProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
  onDismiss?: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  type = 'error',
  duration = 5000,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '✕';
    }
  };

  const bgColor = type === 'error' ? 'bg-error/90' : type === 'warning' ? 'bg-warning/90' : 'bg-primary/90';

  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-3 ${bgColor} text-white rounded-lg shadow-lg min-h-[56px]`} role="alert">
      <div className="flex items-center gap-3">
        <span className="text-xl">{getIcon()}</span>
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="text-white hover:text-white/80 text-xl leading-none bg-transparent border-none cursor-pointer p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
};

// Container component for managing multiple notifications
interface NotificationContainerProps {
  notifications: Array<ErrorNotificationProps & { id: string }>;
  onDismiss: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[2000] flex flex-col gap-3 max-w-md">
      {notifications.map((notification) => (
        <ErrorNotification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </div>
  );
};

export default ErrorNotification;
