import React, { useCallback } from 'react';
import { Eye } from 'lucide-react';
import { signJWT } from '../../utils/jwt';

const SignJWT = ({ currentTab, onUpdateJWTData, onShowError, onShowSuccess }) => {
  const handleSignJWT = useCallback(async () => {
    try {
      if (!currentTab?.signingPrivateKey) {
        const hasPublicOnly = currentTab?.signingPublicKey && !currentTab?.signingPrivateKey;
        if (hasPublicOnly) {
          throw new Error('Cannot sign with public key only. Signing requires a private key. Only verify operation is available with public keys.');
        } else {
          throw new Error('No signing private key available. Please generate or input a JWK Set with signing key.');
        }
      }

      const payloadText = currentTab.jwtData.signPayload.trim();
      if (!payloadText) {
        throw new Error('Please enter a payload to sign.');
      }

      const payload = JSON.parse(payloadText);
      
      // Find signing key ID from JWK Set
      let signingKid = null;
      if (currentTab.jwkSet?.keys) {
        const signingJwk = currentTab.jwkSet.keys.find(k => k.use === 'sig' || k.alg === 'RS256');
        signingKid = signingJwk?.kid;
      }
      
      const jwt = await signJWT(payload, currentTab.signingPrivateKey, signingKid);
      
      onUpdateJWTData({ signedJwt: jwt });
      onShowSuccess('JWT signed successfully with signing key!');
    } catch (error) {
      onShowError(`Failed to sign JWT: ${error.message}`);
    }
  }, [currentTab, onUpdateJWTData, onShowError, onShowSuccess]);

  const handlePayloadChange = useCallback((e) => {
    onUpdateJWTData({ signPayload: e.target.value });
  }, [onUpdateJWTData]);

  const isDisabled = !currentTab?.signingPrivateKey;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Payload (JSON)
        </label>
        <textarea
          value={currentTab?.jwtData.signPayload || ''}
          onChange={handlePayloadChange}
          rows={4}
          className="w-full p-4 border-2 border-slate-300 rounded-lg font-mono text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
          placeholder='{"sub": "1234567890", "name": "John Doe", "iat": 1516239022}'
        />
      </div>
      
      <button
        onClick={handleSignJWT}
        disabled={isDisabled}
        className={`px-8 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 ${
          isDisabled
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white'
        }`}
        title={isDisabled ? 'Signing requires a private key. Only verify operation is available with public keys.' : ''}
      >
        <Eye className="w-5 h-5" />
        Sign JWT
      </button>
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Signed JWT
        </label>
        <textarea
          value={currentTab?.jwtData.signedJwt || ''}
          readOnly
          rows={4}
          className="w-full p-4 border-2 border-slate-300 rounded-lg font-mono text-sm bg-slate-100 resize-none"
        />
      </div>
    </div>
  );
};

export default SignJWT;