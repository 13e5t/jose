import React, { useCallback } from 'react';
import { Unlock } from 'lucide-react';
import { decryptJWT } from '../../utils/jwt';

const DecryptJWT = ({ currentTab, onUpdateJWTData, onShowError, onShowSuccess }) => {
  const handleDecryptJWT = useCallback(async () => {
    try {
      if (!currentTab?.encryptionPrivateKey) {
        const hasPublicOnly = currentTab?.encryptionPublicKey && !currentTab?.encryptionPrivateKey;
        if (hasPublicOnly) {
          throw new Error('Cannot decrypt with public key only. Decryption requires a private key. Only encrypt operation is available with public keys.');
        } else {
          throw new Error('No encryption private key available. Please generate or input a JWK Set with encryption key.');
        }
      }

      const jwtText = currentTab.jwtData.decryptJwt.trim();
      if (!jwtText) {
        throw new Error('Please enter an encrypted JWT to decrypt.');
      }

      const { result, messageType } = await decryptJWT(jwtText, currentTab.encryptionPrivateKey);
      
      // Display result based on type
      const displayResult = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      
      onUpdateJWTData({ decryptResult: displayResult });
      onShowSuccess(`JWT decrypted successfully! Original format: ${messageType}`);
    } catch (error) {
      onShowError(`Failed to decrypt JWT: ${error.message}`);
    }
  }, [currentTab, onUpdateJWTData, onShowError, onShowSuccess]);

  const handleJWTChange = useCallback((e) => {
    onUpdateJWTData({ decryptJwt: e.target.value });
  }, [onUpdateJWTData]);

  const isDisabled = !currentTab?.encryptionPrivateKey;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Encrypted JWT
        </label>
        <textarea
          value={currentTab?.jwtData.decryptJwt || ''}
          onChange={handleJWTChange}
          rows={4}
          className="w-full p-4 border-2 border-slate-300 rounded-lg font-mono text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
          placeholder="Enter encrypted JWT"
        />
      </div>
      
      <button
        onClick={handleDecryptJWT}
        disabled={isDisabled}
        className={`px-8 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 ${
          isDisabled
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
        }`}
        title={isDisabled ? 'Decryption requires a private key. Only encrypt operation is available with public keys.' : ''}
      >
        <Unlock className="w-5 h-5" />
        Decrypt JWT
      </button>
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Decrypted Payload
        </label>
        <textarea
          value={currentTab?.jwtData.decryptResult || ''}
          readOnly
          rows={4}
          className="w-full p-4 border-2 border-slate-300 rounded-lg font-mono text-sm bg-slate-100 resize-none"
        />
      </div>
    </div>
  );
};

export default DecryptJWT;