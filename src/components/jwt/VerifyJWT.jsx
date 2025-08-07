import React, { useCallback } from 'react';
import { CheckCircle } from 'lucide-react';
import { verifyJWT } from '../../utils/jwt';

const VerifyJWT = ({ currentTab, onUpdateJWTData, onShowError, onShowSuccess }) => {
  const handleVerifyJWT = useCallback(async () => {
    try {
      if (!currentTab?.signingPublicKey) {
        throw new Error('No signing public key available. Please generate or input a JWK Set with signing key.');
      }

      const jwtText = currentTab.jwtData.verifyJwt.trim();
      if (!jwtText) {
        throw new Error('Please enter a JWT to verify.');
      }

      const result = await verifyJWT(jwtText, currentTab.signingPublicKey);
      
      onUpdateJWTData({ verifyResult: JSON.stringify(result, null, 2) });
      
      if (result.valid) {
        onShowSuccess('JWT verified successfully with signing key!');
      } else {
        onShowError(`JWT verification failed: ${result.message}`);
      }
    } catch (error) {
      const result = {
        valid: false,
        message: 'JWT verification failed: ' + error.message
      };
      onUpdateJWTData({ verifyResult: JSON.stringify(result, null, 2) });
      onShowError(`JWT verification failed: ${error.message}`);
    }
  }, [currentTab, onUpdateJWTData, onShowError, onShowSuccess]);

  const handleJWTChange = useCallback((e) => {
    onUpdateJWTData({ verifyJwt: e.target.value });
  }, [onUpdateJWTData]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          JWT to Verify
        </label>
        <textarea
          value={currentTab?.jwtData.verifyJwt || ''}
          onChange={handleJWTChange}
          rows={4}
          className="w-full p-4 border-2 border-slate-300 rounded-lg font-mono text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
          placeholder="Enter JWT to verify"
        />
      </div>
      
      <button
        onClick={handleVerifyJWT}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
      >
        <CheckCircle className="w-5 h-5" />
        Verify JWT
      </button>
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Verification Result
        </label>
        <textarea
          value={currentTab?.jwtData.verifyResult || ''}
          readOnly
          rows={4}
          className="w-full p-4 border-2 border-slate-300 rounded-lg font-mono text-sm bg-slate-100 resize-none"
        />
      </div>
    </div>
  );
};

export default VerifyJWT;