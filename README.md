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
├── src/
│   ├── components/     # React components
│   │   ├── jwt/       # JWT operation components
│   │   ├── JWKTabBar.jsx
│   │   ├── JWKManagement.jsx
│   │   └── JWTOperations.jsx
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── types/         # Type definitions
│   ├── App.jsx        # Main React app component
│   ├── main.jsx       # React entry point
│   └── index.css      # Global styles
├── public/            # Static assets
├── index.html         # HTML entry point
├── package.json       # Dependencies and scripts
├── vite.config.js     # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
├── netlify.toml       # Netlify deployment configuration
├── vercel.json        # Vercel deployment configuration
├── CLAUDE.md          # Claude Code development guidance
├── PRD.md            # Product Requirements Document
├── MIGRATION-TO-REACT.md # React migration guide
└── README.md          # This documentation
```

## 🚀 Quick Start

### React Development (Recommended)
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Legacy Development (Vanilla JS)
1. Use the original `app.js` and `styles.css` files
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

## 🔧 JWK Compatibility

### Multi-Library Support
- **JavaScript JOSE**: Native support for keys generated by this app
- **Nimbus JOSE + JWT (Java)**: Full compatibility with base64url encoding fixes
- **Other JOSE Libraries**: Automatic normalization for cross-platform compatibility

### Key Format Support
- **RSA Keys**: RS256 (signing) and RSA-OAEP-256 (encryption)
- **Format Tolerance**: Handles padding and encoding variations
- **Error Recovery**: Individual key import with detailed error reporting

## 🚀 Netlify Deployment

This application is optimized for Netlify deployment with the following features:

### Automatic Configuration
```toml
# netlify.toml is included for optimal performance
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.skypack.dev https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline'"
```

### Deployment Steps
1. **Drag & Drop** (Fastest):
   - Visit [netlify.com](https://netlify.com)
   - Drag the entire project folder to the deploy area
   - Get instant HTTPS deployment with global CDN

2. **Git Integration** (Recommended for updates):
   - Push code to GitHub/GitLab
   - Connect repository to Netlify
   - Automatic deployments on every commit

### Why Netlify?
- ✅ **Zero Configuration**: Works out of the box
- ✅ **Global CDN**: Fast loading worldwide
- ✅ **Automatic HTTPS**: SSL certificates included
- ✅ **Edge Optimization**: Optimized for static sites
- ✅ **Security Headers**: Pre-configured for crypto applications

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Crypto Library**: [jose](https://github.com/panva/jose) v5 - JavaScript JOSE implementation
- **Deployment**: Netlify with optimized configurations
- **Security**: CSP, HSTS, and comprehensive security headers
- **Compatibility**: Cross-platform JWK support (Nimbus JOSE + JWT, etc.)