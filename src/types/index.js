/**
 * @typedef {Object} JWTData
 * @property {string} signPayload - Sign JWT input payload
 * @property {string} signedJwt - Sign JWT output
 * @property {string} verifyJwt - Verify JWT input
 * @property {string} verifyResult - Verify JWT output
 * @property {string} encryptPayload - Encrypt JWT input payload
 * @property {string} encryptedJwt - Encrypt JWT output
 * @property {string} decryptJwt - Decrypt JWT input
 * @property {string} decryptResult - Decrypt JWT output
 */

/**
 * @typedef {Object} JWKTab
 * @property {string} id - Unique tab identifier
 * @property {string} name - User-editable tab name
 * @property {Object|null} jwkSet - Parsed JWK Set object
 * @property {string} jwkContent - Raw JWK Set JSON content
 * @property {CryptoKey|null} signingPrivateKey - RSA private signing key
 * @property {CryptoKey|null} signingPublicKey - RSA public signing key
 * @property {CryptoKey|null} encryptionPrivateKey - RSA private encryption key
 * @property {CryptoKey|null} encryptionPublicKey - RSA public encryption key
 * @property {JWTData} jwtData - JWT operation data
 */

/**
 * @typedef {Object} MessageState
 * @property {string} message - Message content
 * @property {'success' | 'error' | 'info'} type - Message type
 * @property {boolean} visible - Message visibility
 */

export const MESSAGE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info'
};

export const JWT_OPERATION_TABS = {
  SIGN: 'sign',
  VERIFY: 'verify',
  ENCRYPT: 'encrypt',
  DECRYPT: 'decrypt'
};