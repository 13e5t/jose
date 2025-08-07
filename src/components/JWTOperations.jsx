import React, { useState, useCallback } from 'react';
import { Eye, CheckCircle, Lock, Unlock } from 'lucide-react';
import { JWT_OPERATION_TABS } from '../types';
import SignJWT from './jwt/SignJWT';
import VerifyJWT from './jwt/VerifyJWT';
import EncryptJWT from './jwt/EncryptJWT';
import DecryptJWT from './jwt/DecryptJWT';

const JWTOperations = ({ 
  currentTab, 
  onUpdateJWTData, 
  onShowMessage, 
  onShowError, 
  onShowSuccess 
}) => {
  const [activeJWTTab, setActiveJWTTab] = useState(JWT_OPERATION_TABS.SIGN);

  const getJWKStatus = useCallback(() => {
    if (!currentTab) return 'No keys loaded';

    const hasSigningKeys = !!(currentTab.signingPrivateKey && currentTab.signingPublicKey);
    const hasEncryptionKeys = !!(currentTab.encryptionPrivateKey && currentTab.encryptionPublicKey);
    const hasSigningPublicOnly = !currentTab.signingPrivateKey && currentTab.signingPublicKey;
    const hasEncryptionPublicOnly = !currentTab.encryptionPrivateKey && currentTab.encryptionPublicKey;

    if (hasSigningKeys && hasEncryptionKeys) {
      return { text: 'Ready for signing & encryption', class: 'jwt-status-both' };
    } else if (hasSigningKeys) {
      return { text: 'Ready for signing only', class: 'jwt-status-signing' };
    } else if (hasEncryptionKeys) {
      return { text: 'Ready for encryption only', class: 'jwt-status-encryption' };
    } else if (hasSigningPublicOnly && hasEncryptionPublicOnly) {
      return { text: 'Public keys only - verify & encrypt available', class: 'jwt-status-public-both' };
    } else if (hasSigningPublicOnly) {
      return { text: 'Public key only - verify available', class: 'jwt-status-public-signing' };
    } else if (hasEncryptionPublicOnly) {
      return { text: 'Public key only - encrypt available', class: 'jwt-status-public-encryption' };
    } else {
      return { text: 'No keys loaded', class: '' };
    }
  }, [currentTab]);

  const jwkStatus = getJWKStatus();

  const tabs = [
    { id: JWT_OPERATION_TABS.SIGN, label: 'Sign JWT', icon: Eye },
    { id: JWT_OPERATION_TABS.VERIFY, label: 'Verify JWT', icon: CheckCircle },
    { id: JWT_OPERATION_TABS.ENCRYPT, label: 'Encrypt JWT', icon: Lock },
    { id: JWT_OPERATION_TABS.DECRYPT, label: 'Decrypt JWT', icon: Unlock }
  ];

  const renderActiveTab = () => {
    const commonProps = {
      currentTab,
      onUpdateJWTData,
      onShowMessage,
      onShowError,
      onShowSuccess
    };

    switch (activeJWTTab) {
      case JWT_OPERATION_TABS.SIGN:
        return <SignJWT {...commonProps} />;
      case JWT_OPERATION_TABS.VERIFY:
        return <VerifyJWT {...commonProps} />;
      case JWT_OPERATION_TABS.ENCRYPT:
        return <EncryptJWT {...commonProps} />;
      case JWT_OPERATION_TABS.DECRYPT:
        return <DecryptJWT {...commonProps} />;
      default:
        return <SignJWT {...commonProps} />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 border border-slate-200">
      <div className="flex items-center mb-6">
        <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full mr-4"></div>
        <h2 className="text-2xl font-semibold text-slate-800">JWT Operations</h2>
      </div>
      
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-3">
        <span className="text-slate-600 font-medium">Using JWK:</span>
        <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentTab?.name || 'No Tab'}
        </span>
        <span className={`text-slate-500 italic ml-auto ${jwkStatus.class}`}>
          {jwkStatus.text}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeJWTTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveJWTTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="animate-fade-in">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default JWTOperations;