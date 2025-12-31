import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

const Toast = ({ message, type = 'info', duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-mediumDarkGray',
          border: 'border-limeGreen',
          text: 'text-limeGreen',
          borderWidth: 'border-l-4'
        };
      case 'error':
        return {
          bg: 'bg-mediumDarkGray',
          border: 'border-red',
          text: 'text-red',
          borderWidth: 'border-l-4'
        };
      case 'warning':
        return {
          bg: 'bg-mediumDarkGray',
          border: 'border-brightYellow',
          text: 'text-brightYellow',
          borderWidth: 'border-l-4'
        };
      case 'info':
      default:
        return {
          bg: 'bg-mediumDarkGray',
          border: 'border-cyan',
          text: 'text-cyan',
          borderWidth: 'border-l-4'
        };
    }
  };

  if (!isVisible) return null;

  const styles = getTypeStyles();

  return (
    <div className={`px-4 py-3 rounded-lg shadow-xl ${styles.bg} ${styles.border} ${styles.borderWidth} z-50 min-w-[300px] max-w-md`}>
      <div className="flex items-center">
        <p className={`text-sm font-medium ${styles.text} flex-1`} style={{ fontFamily: 'TCM' }}>
          {message}
        </p>
        <button 
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="ml-4 text-lightGray opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
          style={{ fontFamily: 'TCM' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast; 