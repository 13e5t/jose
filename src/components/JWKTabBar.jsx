import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const JWKTabBar = ({ tabs, activeTabId, onTabSwitch, onTabAdd, onTabRemove, onTabRename }) => {
  const [editingTabId, setEditingTabId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleTabNameClick = (tab) => {
    setEditingTabId(tab.id);
    setEditingName(tab.name);
  };

  const handleNameSubmit = () => {
    if (editingTabId && editingName.trim()) {
      onTabRename(editingTabId, editingName.trim());
    }
    setEditingTabId(null);
    setEditingName('');
  };

  const handleNameCancel = () => {
    setEditingTabId(null);
    setEditingName('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {Array.from(tabs.values()).map(tab => (
        <div
          key={tab.id}
          className={`flex items-center px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer min-w-[140px] ${
            tab.id === activeTabId
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
          onClick={() => !editingTabId && onTabSwitch(tab.id)}
        >
          <div className="flex-1">
            {editingTabId === tab.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={handleKeyDown}
                className={`bg-transparent border-none outline-none text-sm font-medium w-full ${
                  tab.id === activeTabId ? 'text-white placeholder-blue-200' : 'text-slate-700'
                }`}
                autoFocus
              />
            ) : (
              <span
                className={`text-sm font-medium ${
                  tab.id === activeTabId ? 'text-white' : 'text-slate-700'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabNameClick(tab);
                }}
              >
                {tab.name}
              </span>
            )}
          </div>
          {tab.id !== 'default' && !editingTabId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabRemove(tab.id);
              }}
              className={`ml-2 w-5 h-5 flex items-center justify-center rounded-full transition-colors ${
                tab.id === activeTabId
                  ? 'text-white hover:bg-blue-400'
                  : 'text-slate-600 hover:bg-slate-400'
              }`}
              title="Close tab"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      
      <button
        onClick={onTabAdd}
        className="w-8 h-8 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full flex items-center justify-center font-bold transition-all hover:scale-105"
        title="Add new JWK tab"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default JWKTabBar;