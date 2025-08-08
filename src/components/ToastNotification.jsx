import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { MESSAGE_TYPES } from '../types';

const ToastNotification = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  useEffect(() => {
    if (message.visible) {
      setIsVisible(true);
      setIsExiting(false);
    } else if (!message.visible && isVisible) {
      // Auto-hide when message.visible becomes false
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  }, [message.visible, isVisible]);

  const getMessageStyle = () => {
    switch (message.type) {
      case MESSAGE_TYPES.SUCCESS:
        return 'bg-green-50 border-green-400 text-green-700 shadow-green-100';
      case MESSAGE_TYPES.ERROR:
        return 'bg-red-50 border-red-400 text-red-700 shadow-red-100';
      case MESSAGE_TYPES.INFO:
      default:
        return 'bg-blue-50 border-blue-400 text-blue-700 shadow-blue-100';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case MESSAGE_TYPES.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />;
      case MESSAGE_TYPES.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
      case MESSAGE_TYPES.INFO:
      default:
        return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    }
  };

  const getTitle = () => {
    switch (message.type) {
      case MESSAGE_TYPES.SUCCESS:
        return 'Success';
      case MESSAGE_TYPES.ERROR:
        return 'Error';
      case MESSAGE_TYPES.INFO:
      default:
        return 'Info';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-auto">
      <div
        className={`
          border-l-4 p-4 rounded-r-lg shadow-lg max-w-sm w-full
          transform transition-all duration-300 ease-in-out
          ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
          ${getMessageStyle()}
        `}
      >
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${
              message.type === MESSAGE_TYPES.SUCCESS 
                ? 'text-green-800' 
                : message.type === MESSAGE_TYPES.ERROR 
                ? 'text-red-800' 
                : 'text-blue-800'
            }`}>
              {getTitle()}
            </p>
            <p className="text-sm mt-1 break-words">
              {message.content}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`
              p-1 rounded-full transition-colors flex-shrink-0
              ${message.type === MESSAGE_TYPES.SUCCESS 
                ? 'hover:bg-green-200' 
                : message.type === MESSAGE_TYPES.ERROR 
                ? 'hover:bg-red-200' 
                : 'hover:bg-blue-200'
              }
            `}
            title="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;