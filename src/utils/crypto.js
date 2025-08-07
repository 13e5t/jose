import * as jose from 'jose';

/**
 * Generate a random key ID with optional prefix
 * @param {string} prefix - Optional prefix for the key ID
 * @returns {string} Generated key ID
 */
export const generateKeyId = (prefix = '') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? `${prefix}_${result}` : result;
};

/**
 * Fix base64url encoding issues from different libraries
 * @param {string} value - Base64url encoded value
 * @returns {string} Fixed base64url value
 */
export const fixBase64UrlEncoding = (value) => {
  if (!value) return value;
  
  // Remove any padding characters that might have been added
  let fixed = value.replace(/=/g, '');
  
  // Replace any standard base64 characters with base64url equivalents
  fixed = fixed.replace(/\+/g, '-').replace(/\//g, '_');
  
  return fixed;
};

/**
 * Normalize JWK for compatibility between different JOSE libraries
 * @param {Object} jwk - JWK object to normalize
 * @returns {Object} Normalized JWK object
 */
export const normalizeJWK = (jwk) => {
  const normalized = { ...jwk };
  
  // Fix base64url encoding for all RSA private key components
  const base64Fields = ['n', 'e', 'd', 'p', 'q', 'dp', 'dq', 'qi'];
  
  for (const field of base64Fields) {
    if (normalized[field]) {
      normalized[field] = fixBase64UrlEncoding(normalized[field]);
    }
  }
  return normalized;
};

/**
 * Detect if JWK set contains only public keys
 * @param {Object} jwkSet - JWK Set to check
 * @returns {boolean} True if contains only public keys
 */
export const isPublicOnlyJWKSet = (jwkSet) => {
  if (!jwkSet) return false;
  
  if (jwkSet.keys && Array.isArray(jwkSet.keys)) {
    // Check if all keys in the set are public only (no private key component 'd')
    return jwkSet.keys.every(jwk => !jwk.d);
  } else {
    // Single JWK provided
    return !jwkSet.d;
  }
};

/**
 * Generate JWK Set with signing and encryption key pairs
 * @returns {Promise<Object>} Generated JWK Set with keys
 */
export const generateJWKSet = async () => {
  try {
    // Generate signing key pair (RS256)
    const { privateKey: sigPrivateKey, publicKey: sigPublicKey } = 
      await jose.generateKeyPair('RS256', { extractable: true });
    
    // Generate encryption key pair (RSA-OAEP-256)
    const { privateKey: encPrivateKey, publicKey: encPublicKey } = 
      await jose.generateKeyPair('RSA-OAEP-256', { extractable: true });

    // Export signing JWK
    const signingJwk = await jose.exportJWK(sigPrivateKey);
    signingJwk.use = 'sig';
    signingJwk.kid = generateKeyId('sig');
    signingJwk.alg = 'RS256';

    // Export encryption JWK
    const encryptionJwk = await jose.exportJWK(encPrivateKey);
    encryptionJwk.use = 'enc';
    encryptionJwk.kid = generateKeyId('enc');
    encryptionJwk.alg = 'RSA-OAEP-256';

    // Create JWK Set
    const jwkSet = {
      keys: [signingJwk, encryptionJwk]
    };

    return {
      jwkSet,
      signingPrivateKey: sigPrivateKey,
      signingPublicKey: sigPublicKey,
      encryptionPrivateKey: encPrivateKey,
      encryptionPublicKey: encPublicKey
    };
  } catch (error) {
    throw new Error(`Failed to generate JWK Set: ${error.message}`);
  }
};

/**
 * Import JWK Set and extract keys
 * @param {Object} jwkSet - JWK Set to import
 * @returns {Promise<Object>} Imported keys
 */
export const importJWKSet = async (jwkSet) => {
  const result = {
    signingPrivateKey: null,
    signingPublicKey: null,
    encryptionPrivateKey: null,
    encryptionPublicKey: null
  };

  try {
    // Process each key in the set
    if (jwkSet.keys && Array.isArray(jwkSet.keys)) {
      for (const jwk of jwkSet.keys) {
        const normalizedJwk = normalizeJWK(jwk);
        
        if (jwk.use === 'sig' || jwk.alg === 'RS256' || 
            (jwk.kty === 'RSA' && jwk.kid && jwk.kid.includes('signing'))) {
          // Signing key
          if (normalizedJwk.d) {
            try {
              result.signingPrivateKey = await jose.importJWK(normalizedJwk);
            } catch (firstError) {
              result.signingPrivateKey = await jose.importJWK(normalizedJwk, 'RS256');
            }
          }
          
          const publicJwk = { ...normalizedJwk };
          delete publicJwk.d;
          delete publicJwk.dp;
          delete publicJwk.dq;
          delete publicJwk.p;
          delete publicJwk.q;
          delete publicJwk.qi;

          result.signingPublicKey = await jose.importJWK(publicJwk);
          
        } else if (jwk.use === 'enc' || jwk.alg === 'RSA-OAEP-256') {
          // Encryption key
          if (normalizedJwk.d) {
            result.encryptionPrivateKey = await jose.importJWK(normalizedJwk);
          }
          
          const publicJwk = { ...normalizedJwk };
          delete publicJwk.d;
          delete publicJwk.dp;
          delete publicJwk.dq;
          delete publicJwk.p;
          delete publicJwk.q;
          delete publicJwk.qi;

          result.encryptionPublicKey = await jose.importJWK(publicJwk);
        }
      }
    } else {
      // Single JWK provided, try to determine its use
      const normalizedJwk = normalizeJWK(jwkSet);
      
      if (jwkSet.use === 'sig' || jwkSet.alg === 'RS256' || !jwkSet.use) {
        if (normalizedJwk.d) {
          try {
            result.signingPrivateKey = await jose.importJWK(normalizedJwk);
          } catch (firstError) {
            result.signingPrivateKey = await jose.importJWK(normalizedJwk, 'RS256');
          }
        }
        
        const publicJwk = { ...normalizedJwk };
        delete publicJwk.d;
        delete publicJwk.dp;
        delete publicJwk.dq;
        delete publicJwk.p;
        delete publicJwk.q;
        delete publicJwk.qi;

        result.signingPublicKey = await jose.importJWK(publicJwk);
      } else if (jwkSet.use === 'enc') {
        if (normalizedJwk.d) {
          result.encryptionPrivateKey = await jose.importJWK(normalizedJwk);
        }
        
        const publicJwk = { ...normalizedJwk };
        delete publicJwk.d;
        delete publicJwk.dp;
        delete publicJwk.dq;
        delete publicJwk.p;
        delete publicJwk.q;
        delete publicJwk.qi;

        result.encryptionPublicKey = await jose.importJWK(publicJwk);
      }
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to import JWK Set: ${error.message}`);
  }
};