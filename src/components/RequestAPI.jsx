import React, { useState, useCallback } from 'react';
import { Send, FileText, CheckCircle } from 'lucide-react';
import * as jose from 'jose';

const RequestAPI = ({ 
  currentTab, 
  onShowMessage, 
  onShowError, 
  onShowSuccess 
}) => {
  const [requestUrl, setRequestUrl] = useState('');
  const [payload, setPayload] = useState('');
  const [customHeaders, setCustomHeaders] = useState('');
  const [result, setResult] = useState('');
  const [verifiedResult, setVerifiedResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const beautifyPayloadJSON = useCallback(() => {
    try {
      const parsed = JSON.parse(payload);
      setPayload(JSON.stringify(parsed, null, 2));
      onShowSuccess('Payload JSON formatted successfully');
    } catch (error) {
      onShowError('Invalid payload JSON format: ' + error.message);
    }
  }, [payload, onShowSuccess, onShowError]);

  const beautifyHeadersJSON = useCallback(() => {
    try {
      const parsed = JSON.parse(customHeaders);
      setCustomHeaders(JSON.stringify(parsed, null, 2));
      onShowSuccess('Headers JSON formatted successfully');
    } catch (error) {
      onShowError('Invalid headers JSON format: ' + error.message);
    }
  }, [customHeaders, onShowSuccess, onShowError]);

  const encryptPayload = useCallback(async () => {
    try {
      if (!currentTab?.encryptionPublicKey) {
        throw new Error('No encryption public key available');
      }

      // Parse the payload as JSON
      let payloadData;
      try {
        payloadData = JSON.parse(payload);
      } catch (error) {
        throw new Error('Invalid JSON payload: ' + error.message);
      }

      // Encrypt the payload using JOSE library
      const jwt = await new jose.EncryptJWT(payloadData)
        .setProtectedHeader({
          alg: 'RSA-OAEP-256',
          enc: 'A256GCM'
        })
        .encrypt(currentTab.encryptionPublicKey);

      return jwt;
    } catch (error) {
      throw new Error('Failed to encrypt payload: ' + error.message);
    }
  }, [currentTab, payload]);

  const handleVerifyResponse = useCallback(async () => {
    if (!result.trim()) {
      onShowError('No response to verify');
      return;
    }

    if (!currentTab?.signingPublicKey) {
      onShowError('No signing public key available for verification');
      return;
    }

    setIsVerifying(true);
    setVerifiedResult('');

    try {
      // Verify the JWT response using JOSE library
      const { payload: verifiedPayload } = await jose.jwtVerify(result.trim(), currentTab.signingPublicKey);
      
      setVerifiedResult(JSON.stringify(verifiedPayload, null, 2));
      onShowSuccess('Response verified successfully');
    } catch (error) {
      onShowError('Failed to verify response: ' + error.message);
      setVerifiedResult('Error: ' + error.message);
    } finally {
      setIsVerifying(false);
    }
  }, [result, currentTab, onShowError, onShowSuccess]);

  const mergeHeaders = useCallback(() => {
    // Default headers
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };

    // Parse custom headers if provided
    let parsedCustomHeaders = {};
    if (customHeaders.trim()) {
      try {
        parsedCustomHeaders = JSON.parse(customHeaders);
      } catch (error) {
        throw new Error('Invalid custom headers JSON: ' + error.message);
      }
    }

    // Merge headers (custom headers override defaults)
    return { ...defaultHeaders, ...parsedCustomHeaders };
  }, [customHeaders]);

  const handleSubmit = useCallback(async () => {
    if (!requestUrl.trim()) {
      onShowError('Please enter a request URL');
      return;
    }

    if (!payload.trim()) {
      onShowError('Please enter a payload');
      return;
    }

    setIsLoading(true);
    setResult('');
    setVerifiedResult('');

    try {
      // Step 1: Merge headers
      const headers = mergeHeaders();
      
      // Step 2: Encrypt the payload
      const encryptedPayload = await encryptPayload();
      
      // Step 3: Send POST request
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          payload: encryptedPayload
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.text();
      
      // Display the raw response
      setResult(responseData);
      onShowSuccess('Request completed successfully. Use verify button to verify the response.');
      
    } catch (error) {
      onShowError(error.message);
      setResult('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [requestUrl, payload, mergeHeaders, encryptPayload, onShowError, onShowSuccess]);

  const getKeyStatus = useCallback(() => {
    if (!currentTab) return 'No keys loaded';

    const hasEncryptionKey = !!currentTab.encryptionPublicKey;
    const hasSigningKey = !!currentTab.signingPublicKey;

    if (hasEncryptionKey && hasSigningKey) {
      return { text: 'Ready for API requests', class: 'jwt-status-both' };
    } else if (hasEncryptionKey) {
      return { text: 'Encryption key available (verification disabled)', class: 'jwt-status-encryption' };
    } else if (hasSigningKey) {
      return { text: 'Signing key available (encryption disabled)', class: 'jwt-status-signing' };
    } else {
      return { text: 'No keys loaded', class: '' };
    }
  }, [currentTab]);

  const keyStatus = getKeyStatus();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 border border-slate-200">
      <div className="flex items-center mb-6">
        <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-4"></div>
        <h2 className="text-2xl font-semibold text-slate-800">Request API</h2>
      </div>
      
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-3">
        <span className="text-slate-600 font-medium">Using JWK:</span>
        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentTab?.name || 'No Tab'}
        </span>
        <span className={`text-slate-500 italic ml-auto ${keyStatus.class}`}>
          {keyStatus.text}
        </span>
      </div>

      <div className="space-y-6">
        {/* Request URL Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Request URL
          </label>
          <input
            type="url"
            value={requestUrl}
            onChange={(e) => setRequestUrl(e.target.value)}
            placeholder="http://apis.myapi.com/secure/deeplink"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Payload Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-700">
              JSON Payload
            </label>
            <button
              onClick={beautifyPayloadJSON}
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              Beautify
            </button>
          </div>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder='{"key": "value", "data": "example"}'
            rows={6}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
          />
        </div>

        {/* Custom Headers Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-700">
              Custom Headers (Optional)
            </label>
            <button
              onClick={beautifyHeadersJSON}
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              Beautify
            </button>
          </div>
          <textarea
            value={customHeaders}
            onChange={(e) => setCustomHeaders(e.target.value)}
            placeholder='{"Authorization": "Bearer token", "X-Custom-Header": "value"}'
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">
            Default headers: {`{"Content-Type": "application/json"}`}. Custom headers will override defaults.
          </p>
        </div>

        {/* Submit Button */}
        <div>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !currentTab?.encryptionPublicKey || !currentTab?.signingPublicKey}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Request
              </>
            )}
          </button>
        </div>

        {/* Response Display */}
        {result && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Response
            </label>
            <textarea
              value={result}
              readOnly
              rows={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-sm"
            />
            
            {/* Verify Button */}
            <div className="mt-4">
              <button
                onClick={handleVerifyResponse}
                disabled={isVerifying || !currentTab?.signingPublicKey || !result.trim()}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Verify Response
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Verified Result Display */}
        {verifiedResult && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Verified Result
            </label>
            <textarea
              value={verifiedResult}
              readOnly
              rows={8}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestAPI;