import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing JWK tabs state
 */
export const useJWKTabs = () => {
  const tabCounterRef = useRef(1);
  
  const [tabs, setTabs] = useState(() => {
    const defaultTab = {
      id: 'default',
      name: 'Default JWK',
      jwkSet: null,
      jwkContent: '',
      signingPrivateKey: null,
      signingPublicKey: null,
      encryptionPrivateKey: null,
      encryptionPublicKey: null,
      jwtData: {
        signPayload: '',
        signedJwt: '',
        verifyJwt: '',
        verifyResult: '',
        encryptPayload: '',
        encryptedJwt: '',
        decryptJwt: '',
        decryptResult: ''
      }
    };
    return new Map([['default', defaultTab]]);
  });
  
  const [activeTabId, setActiveTabId] = useState('default');

  const addTab = useCallback(() => {
    const newTabId = `tab-${tabCounterRef.current++}`;
    const newTabName = `JWK Set ${tabCounterRef.current - 1}`;

    const newTab = {
      id: newTabId,
      name: newTabName,
      jwkSet: null,
      jwkContent: '',
      signingPrivateKey: null,
      signingPublicKey: null,
      encryptionPrivateKey: null,
      encryptionPublicKey: null,
      jwtData: {
        signPayload: '',
        signedJwt: '',
        verifyJwt: '',
        verifyResult: '',
        encryptPayload: '',
        encryptedJwt: '',
        decryptJwt: '',
        decryptResult: ''
      }
    };

    setTabs(prevTabs => {
      const newTabs = new Map(prevTabs);
      newTabs.set(newTabId, newTab);
      return newTabs;
    });

    setActiveTabId(newTabId);
    return newTabId;
  }, []);

  const removeTab = useCallback((tabId) => {
    if (tabId === 'default') return;

    setTabs(prevTabs => {
      const newTabs = new Map(prevTabs);
      newTabs.delete(tabId);
      return newTabs;
    });

    if (activeTabId === tabId) {
      const remainingTabs = Array.from(tabs.keys()).filter(id => id !== tabId);
      setActiveTabId(remainingTabs[0] || 'default');
    }
  }, [activeTabId, tabs]);

  const updateTab = useCallback((tabId, updates) => {
    setTabs(prevTabs => {
      const newTabs = new Map(prevTabs);
      const existingTab = newTabs.get(tabId);
      if (existingTab) {
        newTabs.set(tabId, { ...existingTab, ...updates });
      }
      return newTabs;
    });
  }, []);

  const updateTabName = useCallback((tabId, name) => {
    updateTab(tabId, { name });
  }, [updateTab]);

  const updateJWKData = useCallback((tabId, jwkData) => {
    updateTab(tabId, jwkData);
  }, [updateTab]);

  const updateJWTData = useCallback((tabId, jwtData) => {
    setTabs(prevTabs => {
      const newTabs = new Map(prevTabs);
      const existingTab = newTabs.get(tabId);
      if (existingTab) {
        newTabs.set(tabId, {
          ...existingTab,
          jwtData: { ...existingTab.jwtData, ...jwtData }
        });
      }
      return newTabs;
    });
  }, []);

  const getCurrentTab = useCallback(() => {
    return tabs.get(activeTabId);
  }, [tabs, activeTabId]);

  const switchTab = useCallback((tabId) => {
    if (tabs.has(tabId)) {
      setActiveTabId(tabId);
    }
  }, [tabs]);

  return {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    updateTab,
    updateTabName,
    updateJWKData,
    updateJWTData,
    getCurrentTab,
    switchTab
  };
};