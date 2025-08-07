import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { MESSAGE_TYPES } from '../types';

const MessageDisplay = ({ message, onClose }) => {
  if (!message.visible) {
    return (
      <div className="min-h-[60px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 text-slate-500 font-mono text-sm flex items-center justify-center">
        Messages will appear here...
      </div>
    );
  }

  const getMessageStyle = () => {
    switch (message.type) {
      case MESSAGE_TYPES.SUCCESS:
        return 'bg-green-50 border-green-400 text-green-700';
      case MESSAGE_TYPES.ERROR:
        return 'bg-red-50 border-red-400 text-red-700';
      case MESSAGE_TYPES.INFO:
      default:
        return 'bg-blue-50 border-blue-400 text-blue-700';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case MESSAGE_TYPES.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />;
      case MESSAGE_TYPES.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />;
      case MESSAGE_TYPES.INFO:
      default:
        return <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />;
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

  return (
    <div className={`border-l-4 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in ${getMessageStyle()}`}>
      {getIcon()}
      <div className="flex-1">
        <p className={`text-sm font-medium ${message.type === MESSAGE_TYPES.SUCCESS ? 'text-green-800' : message.type === MESSAGE_TYPES.ERROR ? 'text-red-800' : 'text-blue-800'}`}>
          {getTitle()}
        </p>
        <p className="text-sm">
          {message.content}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${message.type === MESSAGE_TYPES.SUCCESS ? 'hover:bg-green-600' : message.type === MESSAGE_TYPES.ERROR ? 'hover:bg-red-600' : 'hover:bg-blue-600'}`}
          title="Close message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default MessageDisplay;