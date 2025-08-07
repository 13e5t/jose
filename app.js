class JWKCryptoApp {
    constructor() {
        this.jwkTabs = new Map();
        this.activeTabId = 'default';
        this.tabCounter = 1;
        this.init();
    }

    init() {
        this.initializeDefaultTab();
        this.setupEventListeners();
        this.setupTabs();
        this.setupJWKTabs();
        this.clearErrors();
        this.updateJWTOperationsDisplay();
        this.restoreJWTOperationData();
    }

    initializeDefaultTab() {
        this.jwkTabs.set('default', {
            id: 'default',
            name: 'Default JWK',
            jwkSet: null,
            signingPrivateKey: null,
            signingPublicKey: null,
            encryptionPrivateKey: null,
            encryptionPublicKey: null,
            jwtData: {
                signPayload: '',
                signedJwt: '',
                verifyJwt: '',
                verifyResult: '',
                encryptPayload: '',
                encryptedJwt: '',
                decryptJwt: '',
                decryptResult: ''
            }
        });
    }

    setupEventListeners() {
        document.getElementById('signJwt').addEventListener('click', () => this.signJWT());
        document.getElementById('verifyJwtBtn').addEventListener('click', () => this.verifyJWT());
        document.getElementById('encryptJwt').addEventListener('click', () => this.encryptJWT());
        document.getElementById('decryptJwtBtn').addEventListener('click', () => this.decryptJWT());
        
        // Add event listeners to save JWT data on input
        const jwtInputIds = ['signPayload', 'verifyJwt', 'encryptPayload', 'decryptJwt'];
        jwtInputIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.saveJWTOperationData());
            }
        });
    }

    setupJWKTabs() {
        document.getElementById('addJwkTab').addEventListener('click', () => this.addJWKTab());
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('.generate-jwk')) {
                this.generateJWK();
            }
            if (e.target.closest('.beautify-jwk')) {
                this.beautifyJWK();
            }
            if (e.target.closest('.clear-jwk')) {
                this.clearJWK();
            }
            if (e.target.closest('.jwk-tab:not(.jwk-add-tab)')) {
                const tabElement = e.target.closest('.jwk-tab');
                const tabId = tabElement.getAttribute('data-tab-id');
                if (tabId) {
                    this.switchJWKTab(tabId);
                }
            }
            if (e.target.classList.contains('jwk-tab-close')) {
                e.stopPropagation();
                const tabElement = e.target.closest('.jwk-tab');
                const tabId = tabElement.getAttribute('data-tab-id');
                if (tabId) {
                    this.closeJWKTab(tabId);
                }
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('jwk-input')) {
                this.handleJWKInput(e);
            }
            if (e.target.classList.contains('jwk-tab-name')) {
                const tabElement = e.target.closest('.jwk-tab');
                const tabId = tabElement.getAttribute('data-tab-id');
                const newName = e.target.textContent.trim() || 'Unnamed JWK';
                
                // Update the internal data
                if (this.jwkTabs.has(tabId)) {
                    const tabData = this.jwkTabs.get(tabId);
                    tabData.name = newName;
                    this.jwkTabs.set(tabId, tabData);
                }
                
                // Update JWT Operations display if this is the active tab
                if (tabId === this.activeTabId) {
                    this.updateJWTOperationsDisplay();
                }
            }
        });

        document.addEventListener('blur', (e) => {
            if (e.target.classList.contains('jwk-tab-name')) {
                const tabElement = e.target.closest('.jwk-tab');
                const tabId = tabElement.getAttribute('data-tab-id');
                const newName = e.target.textContent.trim() || 'Unnamed JWK';
                this.renameJWKTab(tabId, newName);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('jwk-tab-name') && e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
            }
        });
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                tabButtons.forEach(btn => {
                    btn.classList.remove('bg-indigo-500', 'text-white');
                    btn.classList.add('bg-slate-200', 'text-slate-700');
                });
                tabContents.forEach(content => content.classList.replace('block', 'hidden'));
                
                button.classList.remove('bg-slate-200', 'text-slate-700');
                button.classList.add('bg-indigo-500', 'text-white');
                document.getElementById(targetTab).classList.replace('hidden', 'block');
            });
        });
    }

    addJWKTab() {
        const newTabId = `tab-${this.tabCounter++}`;
        const newTabName = `JWK Set ${this.tabCounter - 1}`;

        this.jwkTabs.set(newTabId, {
            id: newTabId,
            name: newTabName,
            jwkSet: null,
            signingPrivateKey: null,
            signingPublicKey: null,
            encryptionPrivateKey: null,
            encryptionPublicKey: null,
            jwtData: {
                signPayload: '',
                signedJwt: '',
                verifyJwt: '',
                verifyResult: '',
                encryptPayload: '',
                encryptedJwt: '',
                decryptJwt: '',
                decryptResult: ''
            }
        });

        this.createJWKTabDOM(newTabId, newTabName);
        this.switchJWKTab(newTabId);
    }

    createJWKTabDOM(tabId, tabName) {
        const tabsContainer = document.getElementById('jwkTabs');
        const addButton = document.getElementById('addJwkTab');

        const tabElement = document.createElement('div');
        tabElement.className = 'jwk-tab';
        tabElement.setAttribute('data-tab-id', tabId);
        tabElement.className = 'flex items-center bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer min-w-[140px]';
        tabElement.innerHTML = `
            <span class="jwk-tab-name flex-1 bg-transparent border-none outline-none text-slate-700" contenteditable="true">${tabName}</span>
            <button class="jwk-tab-close ml-2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-400 transition-colors text-slate-600" title="Close tab">×</button>
        `;

        tabsContainer.insertBefore(tabElement, addButton);

        const contentElement = document.createElement('div');
        contentElement.className = 'jwk-tab-content hidden';
        contentElement.id = `jwk-${tabId}`;
        contentElement.innerHTML = `
            <div class="flex flex-wrap gap-3 mb-6">
                <button class="generate-jwk bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Generate JWK Set
                </button>
                <button class="beautify-jwk bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                    </svg>
                    Beautify
                </button>
                <button class="clear-jwk bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Clear JWK Set
                </button>
            </div>
            <div class="space-y-4">
                <label class="block text-sm font-semibold text-slate-700">JWK Set (JSON Web Key Set)</label>
                <div class="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg mb-3">
                    <p class="text-sm text-blue-700 italic">Paste your custom JWK Set JSON below or generate one using the button above</p>
                </div>
                <textarea class="jwk-input w-full p-4 border-2 border-slate-300 rounded-lg font-mono text-sm bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-y" rows="12" placeholder='Paste your custom JWK Set here, for example:
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
}'></textarea>
            </div>
        `;

        const firstTabContent = document.querySelector('.jwk-tab-content');
        firstTabContent.parentNode.insertBefore(contentElement, firstTabContent.nextSibling);
    }

    switchJWKTab(tabId) {
        if (!this.jwkTabs.has(tabId)) return;

        // Save current tab's JWT operation data before switching
        this.saveJWTOperationData();

        this.activeTabId = tabId;

        document.querySelectorAll('.jwk-tab').forEach(tab => {
            tab.classList.remove('bg-blue-500', 'text-white');
            tab.classList.add('bg-slate-200', 'hover:bg-slate-300', 'text-slate-700');
            tab.querySelector('.jwk-tab-name').classList.remove('text-white');
            tab.querySelector('.jwk-tab-name').classList.add('text-slate-700');
            tab.querySelector('.jwk-tab-close').classList.remove('text-white', 'hover:bg-blue-400');
            tab.querySelector('.jwk-tab-close').classList.add('text-slate-600', 'hover:bg-slate-400');
        });
        document.querySelectorAll('.jwk-tab-content').forEach(content => content.classList.replace('block', 'hidden'));

        const targetTab = document.querySelector(`[data-tab-id="${tabId}"]`);
        const targetContent = document.getElementById(`jwk-${tabId}`);

        if (targetTab) {
            targetTab.classList.remove('bg-slate-200', 'hover:bg-slate-300', 'text-slate-700');
            targetTab.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white');
            targetTab.querySelector('.jwk-tab-name').classList.remove('text-slate-700');
            targetTab.querySelector('.jwk-tab-name').classList.add('text-white');
            targetTab.querySelector('.jwk-tab-close').classList.remove('text-slate-600', 'hover:bg-slate-400');
            targetTab.querySelector('.jwk-tab-close').classList.add('text-white', 'hover:bg-blue-400');
        }
        if (targetContent) targetContent.classList.replace('hidden', 'block');
        
        // Restore the new tab's JWT operation data
        this.restoreJWTOperationData();
        this.updateJWTOperationsDisplay();
    }

    closeJWKTab(tabId) {
        if (tabId === 'default' || !this.jwkTabs.has(tabId)) return;

        const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
        const contentElement = document.getElementById(`jwk-${tabId}`);

        if (tabElement) tabElement.remove();
        if (contentElement) contentElement.remove();

        this.jwkTabs.delete(tabId);

        if (this.activeTabId === tabId) {
            const remainingTabs = Array.from(this.jwkTabs.keys());
            this.switchJWKTab(remainingTabs[0] || 'default');
        }
    }

    renameJWKTab(tabId, newName) {
        if (!this.jwkTabs.has(tabId)) return;

        const tabData = this.jwkTabs.get(tabId);
        tabData.name = newName;
        this.jwkTabs.set(tabId, tabData);
        
        if (tabId === this.activeTabId) {
            this.updateJWTOperationsDisplay();
        }
    }

    updateJWTOperationsDisplay() {
        const currentTab = this.getCurrentJWKTab();
        if (!currentTab) return;

        const activeJwkNameElement = document.getElementById('activeJwkName');
        const jwkStatusElement = document.getElementById('jwkStatus');

        if (activeJwkNameElement) {
            activeJwkNameElement.textContent = currentTab.name;
        }

        if (jwkStatusElement) {
            const hasSigningKeys = !!(currentTab.signingPrivateKey && currentTab.signingPublicKey);
            const hasEncryptionKeys = !!(currentTab.encryptionPrivateKey && currentTab.encryptionPublicKey);
            const hasSigningPublicOnly = !currentTab.signingPrivateKey && currentTab.signingPublicKey;
            const hasEncryptionPublicOnly = !currentTab.encryptionPrivateKey && currentTab.encryptionPublicKey;
            const isPublicOnly = this.isPublicOnlyJWKSet(currentTab.jwkSet);

            jwkStatusElement.className = 'jwt-jwk-status';

            if (hasSigningKeys && hasEncryptionKeys) {
                jwkStatusElement.textContent = 'Ready for signing & encryption';
                jwkStatusElement.classList.add('has-both');
            } else if (hasSigningKeys) {
                jwkStatusElement.textContent = 'Ready for signing only';
                jwkStatusElement.classList.add('has-signing');
            } else if (hasEncryptionKeys) {
                jwkStatusElement.textContent = 'Ready for encryption only';
                jwkStatusElement.classList.add('has-encryption');
            } else if (isPublicOnly && (hasSigningPublicOnly || hasEncryptionPublicOnly)) {
                // Public-only keys detected
                if (hasSigningPublicOnly && hasEncryptionPublicOnly) {
                    jwkStatusElement.textContent = 'Public keys only - verify & encrypt available';
                    jwkStatusElement.classList.add('has-public-both');
                } else if (hasSigningPublicOnly) {
                    jwkStatusElement.textContent = 'Public key only - verify available';
                    jwkStatusElement.classList.add('has-public-signing');
                } else if (hasEncryptionPublicOnly) {
                    jwkStatusElement.textContent = 'Public key only - encrypt available';
                    jwkStatusElement.classList.add('has-public-encryption');
                }
            } else {
                jwkStatusElement.textContent = 'No keys loaded';
            }
        }

        // Update button states based on available keys
        this.updateButtonStates();
    }

    getCurrentJWKTab() {
        return this.jwkTabs.get(this.activeTabId);
    }

    getCurrentJWKInput() {
        const currentContent = document.getElementById(`jwk-${this.activeTabId}`);
        return currentContent ? currentContent.querySelector('.jwk-input') : null;
    }

    saveJWTOperationData() {
        const currentTab = this.getCurrentJWKTab();
        if (!currentTab) return;

        const signPayload = document.getElementById('signPayload');
        const signedJwt = document.getElementById('signedJwt');
        const verifyJwt = document.getElementById('verifyJwt');
        const verifyResult = document.getElementById('verifyResult');
        const encryptPayload = document.getElementById('encryptPayload');
        const encryptedJwt = document.getElementById('encryptedJwt');
        const decryptJwt = document.getElementById('decryptJwt');
        const decryptResult = document.getElementById('decryptResult');

        if (signPayload) currentTab.jwtData.signPayload = signPayload.value;
        if (signedJwt) currentTab.jwtData.signedJwt = signedJwt.value;
        if (verifyJwt) currentTab.jwtData.verifyJwt = verifyJwt.value;
        if (verifyResult) currentTab.jwtData.verifyResult = verifyResult.value;
        if (encryptPayload) currentTab.jwtData.encryptPayload = encryptPayload.value;
        if (encryptedJwt) currentTab.jwtData.encryptedJwt = encryptedJwt.value;
        if (decryptJwt) currentTab.jwtData.decryptJwt = decryptJwt.value;
        if (decryptResult) currentTab.jwtData.decryptResult = decryptResult.value;
    }

    restoreJWTOperationData() {
        const currentTab = this.getCurrentJWKTab();
        if (!currentTab) return;

        const signPayload = document.getElementById('signPayload');
        const signedJwt = document.getElementById('signedJwt');
        const verifyJwt = document.getElementById('verifyJwt');
        const verifyResult = document.getElementById('verifyResult');
        const encryptPayload = document.getElementById('encryptPayload');
        const encryptedJwt = document.getElementById('encryptedJwt');
        const decryptJwt = document.getElementById('decryptJwt');
        const decryptResult = document.getElementById('decryptResult');

        if (signPayload) signPayload.value = currentTab.jwtData.signPayload;
        if (signedJwt) signedJwt.value = currentTab.jwtData.signedJwt;
        if (verifyJwt) verifyJwt.value = currentTab.jwtData.verifyJwt;
        if (verifyResult) verifyResult.value = currentTab.jwtData.verifyResult;
        if (encryptPayload) encryptPayload.value = currentTab.jwtData.encryptPayload;
        if (encryptedJwt) encryptedJwt.value = currentTab.jwtData.encryptedJwt;
        if (decryptJwt) decryptJwt.value = currentTab.jwtData.decryptJwt;
        if (decryptResult) decryptResult.value = currentTab.jwtData.decryptResult;
    }


    async generateJWK() {
        try {
            this.clearErrors();
            this.showMessage('Generating JWK Set...', 'info');

            const currentTab = this.getCurrentJWKTab();
            if (!currentTab) return;

            // Generate signing key pair (RS256)
            const { privateKey: sigPrivateKey, publicKey: sigPublicKey } = await jose.generateKeyPair('RS256', { extractable: true });
            
            // Generate encryption key pair (RSA-OAEP-256)
            const { privateKey: encPrivateKey, publicKey: encPublicKey } = await jose.generateKeyPair('RSA-OAEP-256', { extractable: true });
            
            currentTab.signingPrivateKey = sigPrivateKey;
            currentTab.signingPublicKey = sigPublicKey;
            currentTab.encryptionPrivateKey = encPrivateKey;
            currentTab.encryptionPublicKey = encPublicKey;

            // Export signing JWK
            const signingJwk = await jose.exportJWK(sigPrivateKey);
            signingJwk.use = 'sig';
            signingJwk.kid = this.generateKeyId('sig');
            signingJwk.alg = 'RS256';

            // Export encryption JWK
            const encryptionJwk = await jose.exportJWK(encPrivateKey);
            encryptionJwk.use = 'enc';
            encryptionJwk.kid = this.generateKeyId('enc');
            encryptionJwk.alg = 'RSA-OAEP-256';

            // Create JWK Set
            const jwkSet = {
                keys: [signingJwk, encryptionJwk]
            };

            currentTab.jwkSet = jwkSet;

            const jwkInput = this.getCurrentJWKInput();
            if (jwkInput) {
                jwkInput.value = JSON.stringify(jwkSet, null, 2);
            }
            this.updateJWTOperationsDisplay();
            this.showMessage('JWK Set with signing and encryption keys generated successfully!', 'success');
        } catch (error) {
            this.showError('Failed to generate JWK Set: ' + error.message);
        }
    }

    clearJWK() {
        const currentTab = this.getCurrentJWKTab();
        if (!currentTab) return;

        const jwkInput = this.getCurrentJWKInput();
        if (jwkInput) {
            jwkInput.value = '';
        }
        
        currentTab.jwkSet = null;
        currentTab.signingPrivateKey = null;
        currentTab.signingPublicKey = null;
        currentTab.encryptionPrivateKey = null;
        currentTab.encryptionPublicKey = null;
        
        this.clearResults();
        this.clearErrors();
        this.updateJWTOperationsDisplay();
        this.showMessage('JWK Set cleared', 'info');
    }

    // Helper function to fix base64url encoding issues from different libraries
    fixBase64UrlEncoding(value) {
        if (!value) return value;
        
        // Remove any padding characters that might have been added
        let fixed = value.replace(/=/g, '');
        
        // Replace any standard base64 characters with base64url equivalents
        fixed = fixed.replace(/\+/g, '-').replace(/\//g, '_');
        
        return fixed;
    }

    // Helper function to normalize JWK for compatibility between different JOSE libraries
    normalizeJWK(jwk) {
        const normalized = { ...jwk };
        
        // Fix base64url encoding for all RSA private key components
        const base64Fields = ['n', 'e', 'd', 'p', 'q', 'dp', 'dq', 'qi'];
        
        for (const field of base64Fields) {
            if (normalized[field]) {
                normalized[field] = this.fixBase64UrlEncoding(normalized[field]);
            }
        }
        return normalized;
    }

    // Helper function to detect if JWK set contains only public keys
    isPublicOnlyJWKSet(jwkSet) {
        if (!jwkSet) return false;
        
        if (jwkSet.keys && Array.isArray(jwkSet.keys)) {
            // Check if all keys in the set are public only (no private key component 'd')
            return jwkSet.keys.every(jwk => !jwk.d);
        } else {
            // Single JWK provided
            return !jwkSet.d;
        }
    }

    // Helper function to update button states based on available keys
    updateButtonStates() {
        const currentTab = this.getCurrentJWKTab();
        if (!currentTab) return;

        const hasSigningPrivateKey = !!currentTab.signingPrivateKey;
        const hasEncryptionPrivateKey = !!currentTab.encryptionPrivateKey;
        const signButton = document.getElementById('signJwt');
        const decryptButton = document.getElementById('decryptJwtBtn');

        // Update Sign JWT button
        if (signButton) {
            if (hasSigningPrivateKey) {
                signButton.disabled = false;
                signButton.classList.remove('opacity-50', 'cursor-not-allowed');
                signButton.title = '';
            } else {
                signButton.disabled = true;
                signButton.classList.add('opacity-50', 'cursor-not-allowed');
                signButton.title = 'Signing requires a private key. Only verify operation is available with public keys.';
            }
        }

        // Update Decrypt JWT button
        if (decryptButton) {
            if (hasEncryptionPrivateKey) {
                decryptButton.disabled = false;
                decryptButton.classList.remove('opacity-50', 'cursor-not-allowed');
                decryptButton.title = '';
            } else {
                decryptButton.disabled = true;
                decryptButton.classList.add('opacity-50', 'cursor-not-allowed');
                decryptButton.title = 'Decryption requires a private key. Only encrypt operation is available with public keys.';
            }
        }
    }

    async handleJWKInput(event) {
        try {
            const currentTab = this.getCurrentJWKTab();
            if (!currentTab) return;

            const jwkText = event.target.value.trim();
            if (!jwkText) {
                currentTab.jwkSet = null;
                currentTab.signingPrivateKey = null;
                currentTab.signingPublicKey = null;
                currentTab.encryptionPrivateKey = null;
                currentTab.encryptionPublicKey = null;
                return;
            }

            const jwkSet = JSON.parse(jwkText);
            currentTab.jwkSet = jwkSet;

            // Reset keys
            currentTab.signingPrivateKey = null;
            currentTab.signingPublicKey = null;
            currentTab.encryptionPrivateKey = null;
            currentTab.encryptionPublicKey = null;

            // Process each key in the set
            if (jwkSet.keys && Array.isArray(jwkSet.keys)) {
                for (const jwk of jwkSet.keys) {
                    const normalizedJwk = this.normalizeJWK(jwk);
                    
                    if (jwk.use === 'sig' || jwk.alg === 'RS256' || (jwk.kty === 'RSA' && jwk.kid && jwk.kid.includes('signing'))) {
                        // Signing key
                        if (normalizedJwk.d) {
                            try {
                                // Try multiple approaches for importing RSA private key
                                try {
                                    currentTab.signingPrivateKey = await jose.importJWK(normalizedJwk);
                                } catch (firstError) {
                                    currentTab.signingPrivateKey = await jose.importJWK(normalizedJwk, 'RS256');
                                }
                            } catch (error) {
                                console.warn('Failed to import signing private key:', error);
                                this.showError(`Failed to import signing private key: ${error.message}`);
                                continue;
                            }
                        }
                        
                        const publicJwk = { ...normalizedJwk };
                        delete publicJwk.d;
                        delete publicJwk.dp;
                        delete publicJwk.dq;
                        delete publicJwk.p;
                        delete publicJwk.q;
                        delete publicJwk.qi;

                        try {
                            currentTab.signingPublicKey = await jose.importJWK(publicJwk);
                        } catch (error) {
                            console.warn('Failed to import signing public key:', error);
                            this.showError(`Failed to import signing public key: ${error.message}`);
                        }
                    } else if (jwk.use === 'enc' || jwk.alg === 'RSA-OAEP-256') {
                        // Encryption key
                        if (normalizedJwk.d) {
                            try {
                                currentTab.encryptionPrivateKey = await jose.importJWK(normalizedJwk);
                            } catch (error) {
                                console.warn('Failed to import encryption private key:', error);
                                this.showError(`Failed to import encryption private key: ${error.message}`);
                                continue;
                            }
                        }
                        
                        const publicJwk = { ...normalizedJwk };
                        delete publicJwk.d;
                        delete publicJwk.dp;
                        delete publicJwk.dq;
                        delete publicJwk.p;
                        delete publicJwk.q;
                        delete publicJwk.qi;

                        try {
                            currentTab.encryptionPublicKey = await jose.importJWK(publicJwk);
                        } catch (error) {
                            console.warn('Failed to import encryption public key:', error);
                            this.showError(`Failed to import encryption public key: ${error.message}`);
                        }
                    }
                }
            } else {
                // Single JWK provided, try to determine its use
                const normalizedJwk = this.normalizeJWK(jwkSet);
                
                if (jwkSet.use === 'sig' || jwkSet.alg === 'RS256' || !jwkSet.use) {
                    if (normalizedJwk.d) {
                        // Try multiple approaches for importing RSA private key
                        try {
                            currentTab.signingPrivateKey = await jose.importJWK(normalizedJwk);
                        } catch (firstError) {
                            console.log('Single JWK first import attempt failed, trying with RS256 algorithm:', firstError.message);
                            currentTab.signingPrivateKey = await jose.importJWK(normalizedJwk, 'RS256');
                        }
                    }
                    
                    const publicJwk = { ...normalizedJwk };
                    delete publicJwk.d;
                    delete publicJwk.dp;
                    delete publicJwk.dq;
                    delete publicJwk.p;
                    delete publicJwk.q;
                    delete publicJwk.qi;

                    // For RSA signing keys, don't pass algorithm parameter to importJWK
                    currentTab.signingPublicKey = await jose.importJWK(publicJwk);
                } else if (jwkSet.use === 'enc') {
                    if (normalizedJwk.d) {
                        // For RSA encryption keys, don't pass algorithm parameter to importJWK
                        currentTab.encryptionPrivateKey = await jose.importJWK(normalizedJwk);
                    }
                    
                    const publicJwk = { ...normalizedJwk };
                    delete publicJwk.d;
                    delete publicJwk.dp;
                    delete publicJwk.dq;
                    delete publicJwk.p;
                    delete publicJwk.q;
                    delete publicJwk.qi;

                    // For RSA encryption keys, don't pass algorithm parameter to importJWK
                    currentTab.encryptionPublicKey = await jose.importJWK(publicJwk);
                }
            }
            
            this.clearErrors();
            this.updateJWTOperationsDisplay();
            
            // Show success message indicating what keys were loaded
            const hasSigningKeys = !!(currentTab.signingPrivateKey && currentTab.signingPublicKey);
            const hasEncryptionKeys = !!(currentTab.encryptionPrivateKey && currentTab.encryptionPublicKey);
            const hasSigningPublicOnly = !currentTab.signingPrivateKey && currentTab.signingPublicKey;
            const hasEncryptionPublicOnly = !currentTab.encryptionPrivateKey && currentTab.encryptionPublicKey;
            const isPublicOnly = this.isPublicOnlyJWKSet(currentTab.jwkSet);
            
            if (hasSigningKeys && hasEncryptionKeys) {
                this.showMessage('JWK Set loaded successfully with signing and encryption keys!', 'success');
            } else if (hasSigningKeys) {
                this.showMessage('JWK Set loaded successfully with signing keys only!', 'success');
            } else if (hasEncryptionKeys) {
                this.showMessage('JWK Set loaded successfully with encryption keys only!', 'success');
            } else if (isPublicOnly && (hasSigningPublicOnly || hasEncryptionPublicOnly)) {
                // Public-only keys detected
                if (hasSigningPublicOnly && hasEncryptionPublicOnly) {
                    this.showMessage('JWK Set loaded successfully with public keys only! Features: verify & encrypt', 'success');
                } else if (hasSigningPublicOnly) {
                    this.showMessage('JWK Set loaded successfully with signing public key only! Features: verify', 'success');
                } else if (hasEncryptionPublicOnly) {
                    this.showMessage('JWK Set loaded successfully with encryption public key only! Features: encrypt', 'success');
                }
            } else {
                this.showError('JWK Set was parsed but no valid keys could be imported');
            }
            
        } catch (error) {
            this.showError('Invalid JWK Set format: ' + error.message);
        }
    }

    async signJWT() {
        try {
            this.clearErrors();
            
            const currentTab = this.getCurrentJWKTab();
            
            // Check if button should be disabled (extra safety check)
            const signButton = document.getElementById('signJwt');
            if (signButton && signButton.disabled) {
                return; // Silently ignore clicks on disabled button
            }
            
            if (!currentTab || !currentTab.signingPrivateKey) {
                const isPublicOnly = this.isPublicOnlyJWKSet(currentTab?.jwkSet);
                if (isPublicOnly) {
                    throw new Error('Cannot sign with public key only. Signing requires a private key. Only verify operation is available with public keys.');
                } else {
                    throw new Error('No signing private key available. Please generate or input a JWK Set with signing key.');
                }
            }

            const payloadText = document.getElementById('signPayload').value.trim();
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
            
            const jwt = await new jose.SignJWT(payload)
                .setProtectedHeader({ 
                    alg: 'RS256',
                    kid: signingKid 
                })
                .setIssuedAt()
                .setExpirationTime('2h')
                .sign(currentTab.signingPrivateKey);

            document.getElementById('signedJwt').value = jwt;
            this.saveJWTOperationData();
            this.showMessage('JWT signed successfully with signing key!', 'success');
        } catch (error) {
            this.showError('Failed to sign JWT: ' + error.message);
        }
    }

    async verifyJWT() {
        try {
            this.clearErrors();
            
            const currentTab = this.getCurrentJWKTab();
            if (!currentTab || !currentTab.signingPublicKey) {
                throw new Error('No signing public key available. Please generate or input a JWK Set with signing key.');
            }

            const jwtText = document.getElementById('verifyJwt').value.trim();
            if (!jwtText) {
                throw new Error('Please enter a JWT to verify.');
            }

            const { payload, protectedHeader } = await jose.jwtVerify(jwtText, currentTab.signingPublicKey);

            const result = {
                valid: true,
                header: protectedHeader,
                payload: payload,
                message: 'JWT signature is valid'
            };

            document.getElementById('verifyResult').value = JSON.stringify(result, null, 2);
            this.saveJWTOperationData();
            this.showMessage('JWT verified successfully with signing key!', 'success');
        } catch (error) {
            const result = {
                valid: false,
                message: 'JWT verification failed: ' + error.message
            };
            document.getElementById('verifyResult').value = JSON.stringify(result, null, 2);
            this.saveJWTOperationData();
            this.showError('JWT verification failed: ' + error.message);
        }
    }

    async encryptJWT() {
        try {
            this.clearErrors();
            
            const currentTab = this.getCurrentJWKTab();
            if (!currentTab || !currentTab.encryptionPublicKey) {
                throw new Error('No encryption public key available. Please generate or input a JWK Set with encryption key.');
            }

            const payloadText = document.getElementById('encryptPayload').value.trim();
            if (!payloadText) {
                throw new Error('Please enter a payload to encrypt.');
            }

            let payload;
            let isJsonPayload = false;

            // More robust JSON detection
            try {
                // First check if it looks like JSON (starts with { or [)
                const trimmed = payloadText.trim();
                if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                    payload = JSON.parse(payloadText);
                    // Additional validation - make sure it's actually an object or array
                    if (typeof payload === 'object' && payload !== null) {
                        isJsonPayload = true;
                    } else {
                        // If it parsed to a primitive, treat as plain text
                        payload = payloadText;
                        isJsonPayload = false;
                    }
                } else {
                    // Doesn't look like JSON, treat as plain text
                    payload = payloadText;
                    isJsonPayload = false;
                }
            } catch (jsonError) {
                // If JSON parsing fails, treat as plain text
                payload = payloadText;
                isJsonPayload = false;
            }

            // Find encryption key ID from JWK Set
            let encryptionKid = null;
            if (currentTab.jwkSet?.keys) {
                const encryptionJwk = currentTab.jwkSet.keys.find(k => k.use === 'enc' || k.alg === 'RSA-OAEP-256');
                encryptionKid = encryptionJwk?.kid;
            }

            let jwt;
            if (isJsonPayload) {
                // For JSON payloads, use EncryptJWT with full JWT structure
                jwt = await new jose.EncryptJWT(payload)
                    .setProtectedHeader({ 
                        alg: 'RSA-OAEP-256', 
                        enc: 'A256GCM',
                        kid: encryptionKid 
                    })
                    .encrypt(currentTab.encryptionPublicKey);
            } else {
                // For plain text, use CompactEncrypt to avoid JWT claims validation
                const encoder = new TextEncoder();
                const plaintext = encoder.encode(payload);
                jwt = await new jose.CompactEncrypt(plaintext)
                    .setProtectedHeader({ 
                        alg: 'RSA-OAEP-256', 
                        enc: 'A256GCM',
                        kid: encryptionKid 
                    })
                    .encrypt(currentTab.encryptionPublicKey);
            }

            document.getElementById('encryptedJwt').value = jwt;
            this.saveJWTOperationData();
            
            if (isJsonPayload) {
                this.showMessage('JWT encrypted successfully with JSON payload!', 'success');
            } else {
                this.showMessage('JWT encrypted successfully with plain text payload!', 'success');
            }
        } catch (error) {
            this.showError('Failed to encrypt JWT: ' + error.message);
        }
    }

    async decryptJWT() {
        try {
            this.clearErrors();
            
            const currentTab = this.getCurrentJWKTab();
            
            // Check if button should be disabled (extra safety check)
            const decryptButton = document.getElementById('decryptJwtBtn');
            if (decryptButton && decryptButton.disabled) {
                return; // Silently ignore clicks on disabled button
            }
            
            if (!currentTab || !currentTab.encryptionPrivateKey) {
                const isPublicOnly = this.isPublicOnlyJWKSet(currentTab?.jwkSet);
                if (isPublicOnly) {
                    throw new Error('Cannot decrypt with public key only. Decryption requires a private key. Only encrypt operation is available with public keys.');
                } else {
                    throw new Error('No encryption private key available. Please generate or input a JWK Set with encryption key.');
                }
            }

            const jwtText = document.getElementById('decryptJwt').value.trim();
            if (!jwtText) {
                throw new Error('Please enter an encrypted JWT to decrypt.');
            }

            let displayResult;
            let messageType;
            let protectedHeader;

            try {
                // First try to decrypt as a JWT (for JSON payloads)
                const jwtResult = await jose.jwtDecrypt(jwtText, currentTab.encryptionPrivateKey);
                protectedHeader = jwtResult.protectedHeader;
                displayResult = jwtResult.payload;
                messageType = 'JSON';
            } catch (jwtError) {
                try {
                    // Try to decrypt as compact JWE (for plain text)
                    const { plaintext, protectedHeader: header } = await jose.compactDecrypt(jwtText, currentTab.encryptionPrivateKey);
                    protectedHeader = header;
                    const decoder = new TextDecoder();
                    displayResult = decoder.decode(plaintext);
                    messageType = 'plain text';
                } catch (compactError) {
                    throw new Error(`Failed to decrypt: Unable to decrypt as either JWT (${jwtError.message}) or JWE (${compactError.message})`);
                }
            }

            // Display result based on type
            if (typeof displayResult === 'string') {
                document.getElementById('decryptResult').value = displayResult;
            } else {
                document.getElementById('decryptResult').value = JSON.stringify(displayResult, null, 2);
            }
            
            this.saveJWTOperationData();
            this.showMessage(`JWT decrypted successfully! Original format: ${messageType}`, 'success');
        } catch (error) {
            this.showError('Failed to decrypt JWT: ' + error.message);
        }
    }

    generateKeyId(prefix = '') {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return prefix ? `${prefix}_${result}` : result;
    }

    clearResults() {
        document.getElementById('signedJwt').value = '';
        document.getElementById('verifyResult').value = '';
        document.getElementById('encryptedJwt').value = '';
        document.getElementById('decryptResult').value = '';
    }

    showError(message) {
        const errorContainer = document.getElementById('errorMessages');
        errorContainer.innerHTML = '';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg flex items-start gap-3';
        errorDiv.innerHTML = `
            <svg class="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
                <p class="text-sm font-medium text-red-800">Error</p>
                <p class="text-sm text-red-700">${message}</p>
            </div>
        `;
        errorContainer.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
                if (errorContainer.children.length === 0) {
                    errorContainer.innerHTML = '<p class="text-slate-500 font-mono text-sm flex items-center justify-center">Messages will appear here...</p>';
                }
            }
        }, 5000);
    }

    showMessage(message, type = 'info') {
        const errorContainer = document.getElementById('errorMessages');
        errorContainer.innerHTML = '';
        const messageDiv = document.createElement('div');
        
        if (type === 'success') {
            messageDiv.className = 'bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg flex items-start gap-3';
            messageDiv.innerHTML = `
                <svg class="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <p class="text-sm font-medium text-green-800">Success</p>
                    <p class="text-sm text-green-700">${message}</p>
                </div>
            `;
        } else {
            messageDiv.className = 'bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg flex items-start gap-3';
            messageDiv.innerHTML = `
                <svg class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <p class="text-sm font-medium text-blue-800">Info</p>
                    <p class="text-sm text-blue-700">${message}</p>
                </div>
            `;
        }
        
        errorContainer.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
                if (errorContainer.children.length === 0) {
                    errorContainer.innerHTML = '<p class="text-slate-500 font-mono text-sm flex items-center justify-center">Messages will appear here...</p>';
                }
            }
        }, 3000);
    }

    clearErrors() {
        const errorContainer = document.getElementById('errorMessages');
        errorContainer.innerHTML = '<p class="text-slate-500 font-mono text-sm flex items-center justify-center">Messages will appear here...</p>';
    }

    beautifyJWK() {
        try {
            const jwkInput = this.getCurrentJWKInput();
            if (!jwkInput) return;

            const jwkText = jwkInput.value.trim();
            if (!jwkText) {
                this.showError('No JWK Set to beautify. Please enter or generate a JWK Set first.');
                return;
            }

            // Parse and re-stringify with proper formatting
            const jwkSet = JSON.parse(jwkText);
            const beautifiedJson = JSON.stringify(jwkSet, null, 2);
            
            jwkInput.value = beautifiedJson;
            this.showMessage('JWK Set beautified successfully!', 'success');
        } catch (error) {
            this.showError('Failed to beautify JWK Set: ' + error.message + '. Please ensure the JSON is valid.');
        }
    }
}

// Wait for jose library to load
function waitForJose() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkJose = () => {
            if (window.jose) {
                resolve();
            } else if (window.joseLoadError) {
                reject(window.joseLoadError);
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkJose, 100);
            } else {
                reject(new Error('JOSE library failed to load - timeout'));
            }
        };
        
        checkJose();
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await waitForJose();
        new JWKCryptoApp();
    } catch (error) {
        document.getElementById('errorMessages').innerHTML = `
            <div class="error-message">
                Failed to load JOSE library. Please check your internet connection and refresh the page.
                <br>Error: ${error.message}
            </div>
        `;
    }
});