import * as jose from 'jose';

/**
 * Sign JWT with RS256 algorithm
 * @param {Object} payload - JWT payload
 * @param {CryptoKey} privateKey - Private signing key
 * @param {string} keyId - Key ID for JWT header
 * @returns {Promise<string>} Signed JWT
 */
export const signJWT = async (payload, privateKey, keyId) => {
  try {
    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ 
        alg: 'RS256',
        kid: keyId 
      })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(privateKey);

    return jwt;
  } catch (error) {
    throw new Error(`Failed to sign JWT: ${error.message}`);
  }
};

/**
 * Verify JWT signature
 * @param {string} jwt - JWT to verify
 * @param {CryptoKey} publicKey - Public signing key
 * @returns {Promise<Object>} Verification result
 */
export const verifyJWT = async (jwt, publicKey) => {
  try {
    const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey);

    return {
      valid: true,
      header: protectedHeader,
      payload: payload,
      message: 'JWT signature is valid'
    };
  } catch (error) {
    return {
      valid: false,
      message: 'JWT verification failed: ' + error.message
    };
  }
};

/**
 * Encrypt JWT payload
 * @param {string|Object} payload - Payload to encrypt
 * @param {CryptoKey} publicKey - Public encryption key
 * @param {string} keyId - Key ID for JWE header
 * @returns {Promise<string>} Encrypted JWT
 */
export const encryptJWT = async (payload, publicKey, keyId) => {
  try {
    let isJsonPayload = false;
    let processedPayload = payload;

    // More robust JSON detection
    if (typeof payload === 'string') {
      const trimmed = payload.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          processedPayload = JSON.parse(payload);
          if (typeof processedPayload === 'object' && processedPayload !== null) {
            isJsonPayload = true;
          } else {
            processedPayload = payload;
            isJsonPayload = false;
          }
        } catch (jsonError) {
          processedPayload = payload;
          isJsonPayload = false;
        }
      }
    } else if (typeof payload === 'object' && payload !== null) {
      isJsonPayload = true;
      processedPayload = payload;
    }

    let jwt;
    if (isJsonPayload) {
      // For JSON payloads, use EncryptJWT with full JWT structure
      jwt = await new jose.EncryptJWT(processedPayload)
        .setProtectedHeader({ 
          alg: 'RSA-OAEP-256', 
          enc: 'A256GCM',
          kid: keyId 
        })
        .encrypt(publicKey);
    } else {
      // For plain text, use CompactEncrypt to avoid JWT claims validation
      const encoder = new TextEncoder();
      const plaintext = encoder.encode(processedPayload);
      jwt = await new jose.CompactEncrypt(plaintext)
        .setProtectedHeader({ 
          alg: 'RSA-OAEP-256', 
          enc: 'A256GCM',
          kid: keyId 
        })
        .encrypt(publicKey);
    }

    return { jwt, isJsonPayload };
  } catch (error) {
    throw new Error(`Failed to encrypt JWT: ${error.message}`);
  }
};

/**
 * Decrypt JWT/JWE
 * @param {string} jwt - Encrypted JWT to decrypt
 * @param {CryptoKey} privateKey - Private decryption key
 * @returns {Promise<Object>} Decryption result
 */
export const decryptJWT = async (jwt, privateKey) => {
  try {
    let displayResult;
    let messageType;

    try {
      // First try to decrypt as a JWT (for JSON payloads)
      const jwtResult = await jose.jwtDecrypt(jwt, privateKey);
      displayResult = jwtResult.payload;
      messageType = 'JSON';
    } catch (jwtError) {
      try {
        // Try to decrypt as compact JWE (for plain text)
        const { plaintext } = await jose.compactDecrypt(jwt, privateKey);
        const decoder = new TextDecoder();
        displayResult = decoder.decode(plaintext);
        messageType = 'plain text';
      } catch (compactError) {
        throw new Error(`Failed to decrypt: Unable to decrypt as either JWT (${jwtError.message}) or JWE (${compactError.message})`);
      }
    }

    return { result: displayResult, messageType };
  } catch (error) {
    throw new Error(`Failed to decrypt JWT: ${error.message}`);
  }
};