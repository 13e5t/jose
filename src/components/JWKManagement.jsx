import React, { useCallback } from 'react';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { generateJWKSet, importJWKSet, isPublicOnlyJWKSet } from '../utils/crypto';

const JWKManagement = ({ 
  currentTab, 
  onUpdateTab, 
  onShowMessage,
  onShowError,
  onShowSuccess 
}) => {
  const handleGenerate = useCallback(async () => {
    try {
      onShowMessage('Generating JWK Set...', 'info');
      
      const { jwkSet, signingPrivateKey, signingPublicKey, encryptionPrivateKey, encryptionPublicKey } = 
        await generateJWKSet();

      const jwkContent = JSON.stringify(jwkSet, null, 2);
      
      onUpdateTab({
        jwkSet,
        jwkContent,
        signingPrivateKey,
        signingPublicKey,
        encryptionPrivateKey,
        encryptionPublicKey
      });

      onShowSuccess('JWK Set with signing and encryption keys generated successfully!');
    } catch (error) {
      onShowError(`Failed to generate JWK Set: ${error.message}`);
    }
  }, [onUpdateTab, onShowMessage, onShowError, onShowSuccess]);

  const handleBeautify = useCallback(() => {
    try {
      if (!currentTab.jwkContent.trim()) {
        onShowError('No JWK Set to beautify. Please enter or generate a JWK Set first.');
        return;
      }

      const jwkSet = JSON.parse(currentTab.jwkContent);
      const beautifiedJson = JSON.stringify(jwkSet, null, 2);
      
      onUpdateTab({ jwkContent: beautifiedJson });
      onShowSuccess('JWK Set beautified successfully!');
    } catch (error) {
      onShowError(`Failed to beautify JWK Set: ${error.message}. Please ensure the JSON is valid.`);
    }
  }, [currentTab.jwkContent, onUpdateTab, onShowError, onShowSuccess]);

  const handleClear = useCallback(() => {
    onUpdateTab({
      jwkSet: null,
      jwkContent: '',
      signingPrivateKey: null,
      signingPublicKey: null,
      encryptionPrivateKey: null,
      encryptionPublicKey: null
    });
    onShowMessage('JWK Set cleared', 'info');
  }, [onUpdateTab, onShowMessage]);

  const handleInputChange = useCallback(async (event) => {
    const jwkText = event.target.value;
    const trimmed = jwkText.trim();

    // Always save the raw content
    onUpdateTab({ jwkContent: jwkText });

    if (!trimmed) {
      // Clear keys when input is empty
      onUpdateTab({
        jwkSet: null,
        signingPrivateKey: null,
        signingPublicKey: null,
        encryptionPrivateKey: null,
        encryptionPublicKey: null
      });
      return;
    }

    try {
      const jwkSet = JSON.parse(trimmed);
      
      // Import the keys
      const { signingPrivateKey, signingPublicKey, encryptionPrivateKey, encryptionPublicKey } = 
        await importJWKSet(jwkSet);

      onUpdateTab({
        jwkSet,
        signingPrivateKey,
        signingPublicKey,
        encryptionPrivateKey,
        encryptionPublicKey
      });

      // Show success message indicating what keys were loaded
      const hasSigningKeys = !!(signingPrivateKey && signingPublicKey);
      const hasEncryptionKeys = !!(encryptionPrivateKey && encryptionPublicKey);
      const hasSigningPublicOnly = !signingPrivateKey && signingPublicKey;
      const hasEncryptionPublicOnly = !encryptionPrivateKey && encryptionPublicKey;
      const isPublicOnly = isPublicOnlyJWKSet(jwkSet);
      
      if (hasSigningKeys && hasEncryptionKeys) {
        onShowSuccess('JWK Set loaded successfully with signing and encryption keys!');
      } else if (hasSigningKeys) {
        onShowSuccess('JWK Set loaded successfully with signing keys only!');
      } else if (hasEncryptionKeys) {
        onShowSuccess('JWK Set loaded successfully with encryption keys only!');
      } else if (isPublicOnly && (hasSigningPublicOnly || hasEncryptionPublicOnly)) {
        if (hasSigningPublicOnly && hasEncryptionPublicOnly) {
          onShowSuccess('JWK Set loaded successfully with public keys only! Features: verify & encrypt');
        } else if (hasSigningPublicOnly) {
          onShowSuccess('JWK Set loaded successfully with signing public key only! Features: verify');
        } else if (hasEncryptionPublicOnly) {
          onShowSuccess('JWK Set loaded successfully with encryption public key only! Features: encrypt');
        }
      } else {
        onShowError('JWK Set was parsed but no valid keys could be imported');
      }

    } catch (error) {
      if (error.message.includes('JSON')) {
        // JSON parsing error - don't show error for incomplete typing
        return;
      }
      onShowError(`Invalid JWK Set format: ${error.message}`);
    }
  }, [onUpdateTab, onShowSuccess, onShowError]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 border border-slate-200">
      <div className="flex items-center mb-6">
        <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-4"></div>
        <h2 className="text-2xl font-semibold text-slate-800">JWK Management</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleGenerate}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Generate JWK Set
        </button>
        
        <button
          onClick={handleClear}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Clear JWK Set
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-700">
            JWK Set (JSON Web Key Set)
          </label>
          <button
            onClick={handleBeautify}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <FileText className="w-4 h-4" />
            Beautify
          </button>
        </div>
        
        <textarea
          value={currentTab.jwkContent}
          onChange={handleInputChange}
          className="w-full p-4 border-2 border-slate-300 rounded-lg font-mono text-sm bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-y"
          rows={12}
          placeholder={`Paste your custom JWK Set here, for example:
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "kid": "sig_key_id",
      "alg": "RS256",
      "n": "...",
      "e": "AQAB",
      "d": "..."
    }
  ]
}`}
        />
      </div>
    </div>
  );
};

export default JWKManagement;