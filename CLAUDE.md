# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **client-side-only JWK (JSON Web Key) Crypto Operations Web Application** built with vanilla JavaScript, HTML, and Tailwind CSS. The app provides a tabbed interface for managing multiple JWK sets and performing JWT cryptographic operations including signing, verification, encryption, and decryption.

### Key Features
- **Multi-tab JWK management**: Create and manage multiple independent JWK workspaces
- **Full JWT lifecycle**: Sign, verify, encrypt, and decrypt JWTs using RS256 and RSA-OAEP-256
- **Flexible payload support**: Handles both JSON objects and plain text encryption
- **Cross-library compatibility**: Works with various JOSE implementations (Nimbus JOSE + JWT, etc.)
- **Client-side security**: All operations happen in browser, no server communication

## Architecture & Core Components

### Main Application Class (`app.js`)
The application is built around a single `JWKCryptoApp` class that manages:

- **Tab Management**: Multi-tab JWK workspace system with independent data storage
- **Key Management**: Generation, import, and validation of RSA key pairs for signing and encryption
- **JWT Operations**: Complete JWT lifecycle operations with real-time validation
- **UI State Management**: Tab switching, button states, and message display

### Key Data Structures
```javascript
jwkTabs: Map<tabId, {
  id: string,
  name: string,
  jwkSet: Object,
  signingPrivateKey: CryptoKey,
  signingPublicKey: CryptoKey,
  encryptionPrivateKey: CryptoKey,
  encryptionPublicKey: CryptoKey,
  jwtData: Object  // Per-tab JWT operation data
}>
```

### Cryptographic Operations
- **Key Generation**: Creates RSA-2048 key pairs for both signing (RS256) and encryption (RSA-OAEP-256)
- **JWK Import/Export**: Full JWK Set support with cross-library normalization
- **JWT Signing**: RS256 with automatic header population and key ID matching
- **JWT Verification**: Signature validation with detailed result reporting  
- **JWT Encryption**: Supports both structured JWT claims and plain text via CompactEncrypt
- **JWT Decryption**: Automatic detection and handling of both JWT and JWE formats

## Development Commands

This is a static web application with no build process or package manager dependencies:

### Local Development
```bash
# Simply open in browser - no server required
open index.html
# Or use any local HTTP server
python -m http.server 8000
npx serve .
```

### Testing
- No automated test suite - testing is done manually through the UI
- Test with various JWK formats and JWT payloads
- Verify cross-browser compatibility (Chrome 63+, Firefox 57+, Safari 13.1+, Edge 79+)

## Deployment

### Netlify (Recommended)
- Drag-and-drop deployment ready with `netlify.toml` configuration
- Optimized security headers and CSP for crypto operations
- Global CDN with automatic HTTPS

### Vercel
- Static deployment configured with `vercel.json`
- Same security headers as Netlify deployment

### Manual Deployment
- Copy all files to any static hosting provider
- No server-side processing required

## Dependencies & External Libraries

### Core Dependency
- **JOSE Library v5**: Loaded via CDN with multiple fallbacks (Skypack → jsDelivr → unpkg)
- **Tailwind CSS**: Loaded via CDN for styling

### CDN Fallback Strategy
The app implements robust CDN failover in `index.html:21-50` to ensure JOSE library availability across different network conditions.

## File Structure & Important Files

### Core Files
- `index.html`: Main UI with Tailwind CSS and JOSE library loading
- `app.js`: Complete application logic (1,100+ lines)
- `styles.css`: Custom CSS overrides for Tailwind, tab management, and JWT status styling

### Configuration Files
- `netlify.toml`: Netlify deployment with security headers and caching
- `vercel.json`: Vercel deployment configuration with same security setup
- `README.md`: Comprehensive documentation and deployment guides

## Security Considerations

### Content Security Policy
Both deployment configurations include strict CSP headers allowing only necessary CDN sources for the JOSE library while blocking all other external resources.

### Key Security Features
- Client-side only - no server communication or key transmission
- Secure key generation using Web Crypto API
- No localStorage or persistent key storage
- Comprehensive security headers for production deployment

## Cross-Library Compatibility

The app includes sophisticated JWK normalization (`app.js:495-508`) to handle encoding differences between JOSE library implementations:

- **Base64url encoding fixes**: Handles padding and character set variations
- **Multiple import strategies**: Attempts different import methods for RSA keys
- **Error recovery**: Individual key import with detailed error reporting

## Common Development Tasks

### Adding New Cryptographic Operations
1. Add new tab in JWT Operations section of `index.html`
2. Implement operation method in `JWKCryptoApp` class
3. Add button event listener in `setupEventListeners()`
4. Update `updateButtonStates()` for proper UI state management

### Modifying JWK Support
- Update `handleJWKInput()` method for new key types
- Modify `normalizeJWK()` for cross-library compatibility
- Update key detection logic in JWK processing loops

### UI/UX Changes
- Tailwind classes used throughout - modify in HTML
- Custom overrides in `styles.css` for complex interactions
- Tab management styling in `.jwk-tab-content` and `.tab-content` classes