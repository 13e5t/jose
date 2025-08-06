# JWK Crypto Operations Web App

A modern, tabbed web application for JWK (JSON Web Key) cryptographic operations including encryption, decryption, signing, and verification of JWTs. Each JWK set operates independently with its own workspace.

## ✨ Key Features

### 🔑 Multi-Tab JWK Management
- **Multiple JWK Sets**: Create unlimited JWK tabs for different key sets
- **Independent Workspaces**: Each tab maintains separate keys and JWT data
- **Custom Naming**: Click tab names to rename them (e.g., "Production Keys", "Test Keys")
- **Easy Navigation**: Switch between tabs with visual indicators of active keys

### 🛡️ Comprehensive Crypto Operations
- **JWK Set Generation**: Creates signing (RS256) and encryption (RSA-OAEP-256) key pairs
- **JWT Signing**: Sign JWTs with RS256 algorithm
- **JWT Verification**: Verify JWT signatures with real-time feedback
- **JWT Encryption**: Encrypt JWTs with RSA-OAEP-256 + A256GCM
- **JWT Decryption**: Decrypt JWEs back to original format
- **Flexible Input**: Supports both JSON and plain text encryption
- **Type Preservation**: Maintains original data type through encrypt/decrypt cycle

### 💾 Smart Data Management
- **Per-Tab Memory**: JWT operation data is remembered independently for each tab
- **Real-Time Sync**: Active JWK tab is displayed in JWT Operations section
- **Auto-Save**: Input data is automatically saved when switching tabs
- **Status Indicators**: Visual feedback showing available operations per tab

## 📁 Project Structure

```
jose/
├── index.html          # Main HTML interface with tabbed UI
├── styles.css          # Modern CSS with tab styling
├── app.js             # JavaScript application logic with tab management
├── netlify.toml       # Netlify deployment configuration
├── vercel.json        # Vercel deployment configuration
└── README.md          # This documentation
```

## 🚀 Quick Start

### Local Development
1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. The app runs entirely client-side - no server required!

### Usage Example
1. **Create JWK Tab**: Click the `+` button to create "Production Keys"
2. **Generate Keys**: Click "Generate JWK Set" to create signing & encryption keys
3. **JWT Operations**: Use the keys for signing/encryption - data stays in this tab
4. **Switch Tabs**: Create another tab for "Test Keys" with different operations
5. **Independent Data**: Each tab remembers its own JWT payloads and results

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)
```bash
# Method 1: Drag & Drop
1. Visit [netlify.com](https://netlify.com) and create an account
2. Drag the entire `jose` folder to Netlify's deploy area
3. Your app is live instantly with optimized caching and security headers!

# Method 2: Git Integration
1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Automatic deployments on every commit
```

### Option 2: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd jose/
vercel

# Follow the prompts - automatic optimized deployment
```

### Option 3: GitHub Pages
1. Create a GitHub repository
2. Upload all files to the repository
3. Go to Settings → Pages
4. Select "Deploy from branch" → main
5. Access via `https://yourusername.github.io/repository-name`

## 🔒 Security & Performance

### Security Features
- **Client-Side Only**: All cryptographic operations happen in your browser
- **Zero Server Storage**: Private keys never leave your browser
- **Security Headers**: CSP, HSTS, and other security headers configured
- **HTTPS Enforced**: Secure key handling in production
- **No Tracking**: No analytics or external tracking

### Performance Optimizations
- **CDN Fallbacks**: Multiple CDN sources for JOSE library reliability
- **Static Caching**: Optimized caching headers for fast loading
- **Minimal Dependencies**: Pure JavaScript with only JOSE library
- **Responsive Design**: Works seamlessly on desktop and mobile

### Production Considerations
- This tool is designed for **development and educational purposes**
- For production use, implement additional security layers
- Use in trusted environments with HTTPS
- Consider key rotation and management policies

## 🌍 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 63+ | ✅ Fully Supported |
| Firefox | 57+ | ✅ Fully Supported |
| Safari | 13.1+ | ✅ Fully Supported |
| Edge | 79+ | ✅ Fully Supported |

**Requirements**: Modern browser with Web Crypto API support

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Crypto Library**: [jose](https://github.com/panva/jose) v5 - JavaScript JOSE implementation
- **Deployment**: Netlify/Vercel with optimized configurations
- **Security**: CSP, HSTS, and comprehensive security headers