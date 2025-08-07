import React, { useCallback } from 'react';
import { Lock } from 'lucide-react';
import { encryptJWT } from '../../utils/jwt';

const EncryptJWT = ({ currentTab, onUpdateJWTData, onShowError, onShowSuccess }) => {
  const handleEncryptJWT = useCallback(async () => {
    try {
      if (!currentTab?.encryptionPublicKey) {
        throw new Error('No encryption public key available. Please generate or input a JWK Set with encryption key.');
      }

      const payloadText = currentTab.jwtData.encryptPayload.trim();
      if (!payloadText) {
        throw new Error('Please enter a payload to encrypt.');
      }

      // Find encryption key ID from JWK Set
      let encryptionKid = null;
      if (currentTab.jwkSet?.keys) {
        const encryptionJwk = currentTab.jwkSet.keys.find(k => k.use === 'enc' || k.alg === 'RSA-OAEP-256');
        encryptionKid = encryptionJwk?.kid;
      }

      const { jwt, isJsonPayload } = await encryptJWT(payloadText, currentTab.encryptionPublicKey, encryptionKid);
      
      onUpdateJWTData({ encryptedJwt: jwt });
      
      if (isJsonPayload) {
        onShowSuccess('JWT encrypted successfully with JSON payload!');
      } else {
        onShowSuccess('JWT encrypted successfully with plain text payload!');
      }
    } catch (error) {
      onShowError(`Failed to encrypt JWT: ${error.message}`);
    }
  }, [currentTab, onUpdateJWTData, onShowError, onShowSuccess]);

  const handlePayloadChange = useCallback((e) => {
    onUpdateJWTData({ encryptPayload: e.target.value });
  }, [onUpdateJWTData]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Payload (JSON or Plain Text)
        </label>
        <textarea
          value={currentTab?.jwtData.encryptPayload || ''}
          onChange={handlePayloadChange}
          rows={4}
          className="w-full p-4 border-2 border-slate-300 rounded-lg font-mono text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
          placeholder='JSON: {"sub": "1234567890", "name": "John Doe"} or Plain text: Hello World!'
        />
      </div>
      
      <button
        onClick={handleEncryptJWT}
        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
      >
        <Lock className="w-5 h-5" />
        Encrypt JWT
      </button>
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Encrypted JWT
        </label>
        <textarea
          value={currentTab?.jwtData.encryptedJwt || ''}
          readOnly
          rows={4}
          className="w-full p-4 border-2 border-slate-300 rounded-lg font-mono text-sm bg-slate-100 resize-none"
        />
      </div>
    </div>
  );
};

export default EncryptJWT;