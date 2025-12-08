/**
 * ErrorNotification Component
 *
 * Displays error notifications for API failures, offline status, etc.
 * Auto-dismisses after a timeout or can be manually dismissed.
 */
import React, { useEffect, useState } from 'react';
import './styles.css';

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

  return (
    <div className={`error-notification error-notification--${type}`} role="alert">
      <div className="error-notification__content">
        <span className="error-notification__icon">{getIcon()}</span>
        <span className="error-notification__message">{message}</span>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="error-notification__close"
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
    <div className="error-notification-container">
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
