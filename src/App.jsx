import React, { useCallback } from 'react';
import { useJWKTabs } from './hooks/useJWKTabs';
import { useMessages } from './hooks/useMessages';
import JWKTabBar from './components/JWKTabBar';
import JWKManagement from './components/JWKManagement';
import JWTOperations from './components/JWTOperations';
import MessageDisplay from './components/MessageDisplay';

function App() {
  const {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    updateTabName,
    updateJWKData,
    updateJWTData,
    getCurrentTab,
    switchTab
  } = useJWKTabs();

  const {
    message,
    showSuccess,
    showError,
    showInfo,
    hideMessage
  } = useMessages();

  const currentTab = getCurrentTab();

  // JWK Tab Management
  const handleTabAdd = useCallback(() => {
    addTab();
  }, [addTab]);

  const handleTabRemove = useCallback((tabId) => {
    removeTab(tabId);
  }, [removeTab]);

  const handleTabSwitch = useCallback((tabId) => {
    switchTab(tabId);
  }, [switchTab]);

  const handleTabRename = useCallback((tabId, newName) => {
    updateTabName(tabId, newName);
  }, [updateTabName]);

  // JWK Management
  const handleUpdateJWK = useCallback((updates) => {
    updateJWKData(activeTabId, updates);
  }, [updateJWKData, activeTabId]);

  // JWT Operations
  const handleUpdateJWT = useCallback((updates) => {
    updateJWTData(activeTabId, updates);
  }, [updateJWTData, activeTabId]);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            JWK Crypto Operations
          </h1>
          <p className="text-xl text-slate-600">
            Generate, manage, and test JSON Web Keys with ease
          </p>
        </div>

        {/* JWK Management Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 border border-slate-200">
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-4"></div>
            <h2 className="text-2xl font-semibold text-slate-800">JWK Management</h2>
          </div>
          
          {/* JWK Tabs */}
          <JWKTabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSwitch={handleTabSwitch}
            onTabAdd={handleTabAdd}
            onTabRemove={handleTabRemove}
            onTabRename={handleTabRename}
          />

          {/* JWK Management */}
          <JWKManagement
            currentTab={currentTab}
            onUpdateTab={handleUpdateJWK}
            onShowMessage={showInfo}
            onShowError={showError}
            onShowSuccess={showSuccess}
          />
        </div>

        {/* JWT Operations Section */}
        <JWTOperations
          currentTab={currentTab}
          onUpdateJWTData={handleUpdateJWT}
          onShowMessage={showInfo}
          onShowError={showError}
          onShowSuccess={showSuccess}
        />

        {/* Messages Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-slate-200">
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full mr-4"></div>
            <h2 className="text-2xl font-semibold text-slate-800">Messages</h2>
          </div>
          
          <MessageDisplay
            message={message}
            onClose={hideMessage}
          />
        </div>
      </div>
    </div>
  );
}

export default App;