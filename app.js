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
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
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
        tabElement.innerHTML = `
            <span class="jwk-tab-name" contenteditable="true">${tabName}</span>
            <button class="jwk-tab-close" title="Close tab">×</button>
        `;

        tabsContainer.insertBefore(tabElement, addButton);

        const contentElement = document.createElement('div');
        contentElement.className = 'jwk-tab-content';
        contentElement.id = `jwk-${tabId}`;
        contentElement.innerHTML = `
            <div class="button-group">
                <button class="generate-jwk btn">Generate JWK Set</button>
                <button class="clear-jwk btn">Clear JWK Set</button>
            </div>
            <div class="form-group">
                <label>JWK Set (JSON Web Key Set):</label>
                <textarea class="jwk-input" rows="12" placeholder="Enter JWK Set JSON or generate one using the button above"></textarea>
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

        document.querySelectorAll('.jwk-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.jwk-tab-content').forEach(content => content.classList.remove('active'));

        const targetTab = document.querySelector(`[data-tab-id="${tabId}"]`);
        const targetContent = document.getElementById(`jwk-${tabId}`);

        if (targetTab) targetTab.classList.add('active');
        if (targetContent) targetContent.classList.add('active');
        
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
            } else {
                jwkStatusElement.textContent = 'No keys loaded';
            }
        }
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
                    if (jwk.use === 'sig' || jwk.alg === 'RS256') {
                        // Signing key
                        if (jwk.d) {
                            currentTab.signingPrivateKey = await jose.importJWK(jwk, jwk.alg || 'RS256');
                        }
                        
                        const publicJwk = { ...jwk };
                        delete publicJwk.d;
                        delete publicJwk.dp;
                        delete publicJwk.dq;
                        delete publicJwk.p;
                        delete publicJwk.q;
                        delete publicJwk.qi;

                        currentTab.signingPublicKey = await jose.importJWK(publicJwk, jwk.alg || 'RS256');
                    } else if (jwk.use === 'enc' || jwk.alg === 'RSA-OAEP-256') {
                        // Encryption key
                        if (jwk.d) {
                            currentTab.encryptionPrivateKey = await jose.importJWK(jwk, jwk.alg || 'RSA-OAEP-256');
                        }
                        
                        const publicJwk = { ...jwk };
                        delete publicJwk.d;
                        delete publicJwk.dp;
                        delete publicJwk.dq;
                        delete publicJwk.p;
                        delete publicJwk.q;
                        delete publicJwk.qi;

                        currentTab.encryptionPublicKey = await jose.importJWK(publicJwk, jwk.alg || 'RSA-OAEP-256');
                    }
                }
            } else {
                // Single JWK provided, try to determine its use
                const jwk = jwkSet;
                if (jwk.use === 'sig' || jwk.alg === 'RS256' || !jwk.use) {
                    if (jwk.d) {
                        currentTab.signingPrivateKey = await jose.importJWK(jwk, jwk.alg || 'RS256');
                    }
                    
                    const publicJwk = { ...jwk };
                    delete publicJwk.d;
                    delete publicJwk.dp;
                    delete publicJwk.dq;
                    delete publicJwk.p;
                    delete publicJwk.q;
                    delete publicJwk.qi;

                    currentTab.signingPublicKey = await jose.importJWK(publicJwk, jwk.alg || 'RS256');
                } else if (jwk.use === 'enc') {
                    if (jwk.d) {
                        currentTab.encryptionPrivateKey = await jose.importJWK(jwk, jwk.alg || 'RSA-OAEP-256');
                    }
                    
                    const publicJwk = { ...jwk };
                    delete publicJwk.d;
                    delete publicJwk.dp;
                    delete publicJwk.dq;
                    delete publicJwk.p;
                    delete publicJwk.q;
                    delete publicJwk.qi;

                    currentTab.encryptionPublicKey = await jose.importJWK(publicJwk, jwk.alg || 'RSA-OAEP-256');
                }
            }
            
            this.clearErrors();
            this.updateJWTOperationsDisplay();
        } catch (error) {
            this.showError('Invalid JWK Set format: ' + error.message);
        }
    }

    async signJWT() {
        try {
            this.clearErrors();
            
            const currentTab = this.getCurrentJWKTab();
            if (!currentTab || !currentTab.signingPrivateKey) {
                throw new Error('No signing private key available. Please generate or input a JWK Set with signing key.');
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

            // Try to parse as JSON first
            try {
                payload = JSON.parse(payloadText);
                isJsonPayload = true;
                // Add metadata to indicate this was originally JSON
                payload.__originalType = 'json';
            } catch (jsonError) {
                // If JSON parsing fails, treat as plain text
                payload = { 
                    __originalType: 'text',
                    data: payloadText 
                };
                isJsonPayload = false;
            }

            // Find encryption key ID from JWK Set
            let encryptionKid = null;
            if (currentTab.jwkSet?.keys) {
                const encryptionJwk = currentTab.jwkSet.keys.find(k => k.use === 'enc' || k.alg === 'RSA-OAEP-256');
                encryptionKid = encryptionJwk?.kid;
            }

            const jwt = await new jose.EncryptJWT(payload)
                .setProtectedHeader({ 
                    alg: 'RSA-OAEP-256', 
                    enc: 'A256GCM',
                    kid: encryptionKid 
                })
                .setIssuedAt()
                .setExpirationTime('2h')
                .encrypt(currentTab.encryptionPublicKey);

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
            if (!currentTab || !currentTab.encryptionPrivateKey) {
                throw new Error('No encryption private key available. Please generate or input a JWK Set with encryption key.');
            }

            const jwtText = document.getElementById('decryptJwt').value.trim();
            if (!jwtText) {
                throw new Error('Please enter an encrypted JWT to decrypt.');
            }

            const { payload, protectedHeader } = await jose.jwtDecrypt(jwtText, currentTab.encryptionPrivateKey);

            let displayResult;
            let messageType;

            // Check if this was originally plain text or JSON
            if (payload.__originalType === 'text') {
                // Original was plain text, return just the text
                displayResult = payload.data;
                messageType = 'plain text';
            } else if (payload.__originalType === 'json') {
                // Original was JSON, remove metadata and return JSON
                const cleanPayload = { ...payload };
                delete cleanPayload.__originalType;
                displayResult = cleanPayload;
                messageType = 'JSON';
            } else {
                // Legacy format or no metadata, show full payload
                displayResult = {
                    header: protectedHeader,
                    payload: payload,
                    message: 'JWT decrypted successfully'
                };
                messageType = 'JWT';
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
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = `Error: ${message}`;
        errorContainer.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    showMessage(message, type = 'info') {
        const errorContainer = document.getElementById('errorMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        errorContainer.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    clearErrors() {
        document.getElementById('errorMessages').innerHTML = '';
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