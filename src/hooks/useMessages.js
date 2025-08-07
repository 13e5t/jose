import { useState, useCallback, useRef } from 'react';
import { MESSAGE_TYPES } from '../types';

/**
 * Custom hook for managing UI messages (success, error, info)
 */
export const useMessages = () => {
  const [message, setMessage] = useState({
    content: '',
    type: MESSAGE_TYPES.INFO,
    visible: false
  });
  
  const timeoutRef = useRef(null);

  const showMessage = useCallback((content, type = MESSAGE_TYPES.INFO, duration = 3000) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setMessage({
      content,
      type,
      visible: true
    });

    // Auto-hide after duration (except for errors which stay longer)
    const hideDelay = type === MESSAGE_TYPES.ERROR ? 5000 : duration;
    timeoutRef.current = setTimeout(() => {
      hideMessage();
    }, hideDelay);
  }, []);

  const hideMessage = useCallback(() => {
    setMessage(prev => ({ ...prev, visible: false }));
    
    // Clear timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showSuccess = useCallback((content, duration) => {
    showMessage(content, MESSAGE_TYPES.SUCCESS, duration);
  }, [showMessage]);

  const showError = useCallback((content, duration) => {
    showMessage(content, MESSAGE_TYPES.ERROR, duration);
  }, [showMessage]);

  const showInfo = useCallback((content, duration) => {
    showMessage(content, MESSAGE_TYPES.INFO, duration);
  }, [showMessage]);

  const clearMessage = useCallback(() => {
    hideMessage();
  }, [hideMessage]);

  return {
    message,
    showMessage,
    showSuccess,
    showError,
    showInfo,
    clearMessage,
    hideMessage
  };
};