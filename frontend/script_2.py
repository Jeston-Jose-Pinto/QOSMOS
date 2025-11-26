# 3. Complete JavaScript Application with ALL features implemented
app_js_part1 = """// Quantum Computing Platform - Complete Professional JavaScript Implementation

class QuantumPlatform {
    constructor() {
        // Firebase Configuration
        this.firebaseConfig = {
            apiKey: "AIzaSyBx1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6",
            authDomain: "quantum-platform-demo.firebaseapp.com",
            projectId: "quantum-platform-demo",
            storageBucket: "quantum-platform-demo.appspot.com",
            messagingSenderId: "123456789012",
            appId: "1:123456789012:web:abcdef123456789012345678"
        };

        // Application State
        this.currentUser = null;
        this.currentPage = 'home';
        this.theme = localStorage.getItem('quantum-theme') || 'light';
        this.isBeginnerMode = true;
        this.isDemo = false;
        
        // Circuit State
        this.circuit = [];
        this.qubits = 3;
        this.maxDepth = 8;
        this.history = [];
        this.redoStack = [];
        this.currentLanguage = 'qiskit';
        this.userStats = {
            circuitsCreated: 0,
            gatesUsed: 0,
            simulationsRun: 0,
            codeExports: 0
        };

        // Simulation State
        this.probabilityChart = null;
        this.blochRenderer = null;
        this.currentGateBeingParameterized = null;
        this.draggedElement = null;
        this.dropZones = [];

        // Quantum Gates Database
        this.quantumGates = {
            singleQubit: [
                { name: "Hadamard", symbol: "H", type: "h", color: "#e74c3c", description: "Creates superposition - equal probability of |0⟩ and |1⟩", beginner: true },
                { name: "Pauli-X", symbol: "X", type: "x", color: "#e67e22", description: "Bit flip gate - flips |0⟩ to |1⟩ and vice versa", beginner: true },
                { name: "Pauli-Y", symbol: "Y", type: "y", color: "#f39c12", description: "Bit and phase flip combined", beginner: false },
                { name: "Pauli-Z", symbol: "Z", type: "z", color: "#27ae60", description: "Phase flip - adds π phase to |1⟩ state", beginner: true },
                { name: "Phase", symbol: "S", type: "s", color: "#3498db", description: "π/2 phase gate - quarter turn on Bloch sphere", beginner: false },
                { name: "T-gate", symbol: "T", type: "t", color: "#9b59b6", description: "π/4 phase gate - eighth turn on Bloch sphere", beginner: false }
            ],
            rotationGates: [
                { name: "X-Rotation", symbol: "RX", type: "rx", color: "#e74c3c", description: "Rotation around X-axis", parametric: true, beginner: false },
                { name: "Y-Rotation", symbol: "RY", type: "ry", color: "#f39c12", description: "Rotation around Y-axis", parametric: true, beginner: false },
                { name: "Z-Rotation", symbol: "RZ", type: "rz", color: "#27ae60", description: "Rotation around Z-axis", parametric: true, beginner: false }
            ],
            twoQubitGates: [
                { name: "CNOT", symbol: "CX", type: "cx", color: "#34495e", description: "Controlled-X - flips target if control is |1⟩", beginner: true },
                { name: "Controlled-Z", symbol: "CZ", type: "cz", color: "#2c3e50", description: "Controlled-Z - adds phase if both qubits |1⟩", beginner: false },
                { name: "Swap", symbol: "SWAP", type: "swap", color: "#8e44ad", description: "Swaps the states of two qubits", beginner: false }
            ],
            measurementGates: [
                { name: "Measure", symbol: "M", type: "measure", color: "#95a5a6", description: "Measurement in computational basis", beginner: true }
            ]
        };

        // Initialize Firebase
        this.initializeFirebase();
        
        // Initialize the application
        this.init();
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    init() {
        this.applyTheme();
        this.setupEventListeners();
        this.checkAuthState();
        this.showPage('home');
        this.initializeCircuitBuilder();
    }

    initializeFirebase() {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(this.firebaseConfig);
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            
            // Listen to auth state changes
            this.auth.onAuthStateChanged((user) => {
                if (user) {
                    this.currentUser = user;
                    this.updateNavigation(true);
                    this.loadUserStats();
                } else {
                    this.currentUser = null;
                    this.updateNavigation(false);
                }
            });
        }
    }

    // ==========================================
    // THEME SYSTEM
    // ==========================================
    
    applyTheme() {
        document.body.className = `theme-${this.theme}`;
        this.updateThemeToggle();
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('quantum-theme', this.theme);
        this.applyTheme();
    }

    updateThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.classList.toggle('light', this.theme === 'light');
        }
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-page')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.showPage(page);
            }
        });

        // Auth buttons
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            this.showModal('loginModal');
        });

        document.getElementById('signupBtn')?.addEventListener('click', () => {
            this.showModal('signupModal');
        });

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.signOut();
        });

        // Hero buttons
        document.getElementById('heroGetStarted')?.addEventListener('click', () => {
            if (this.currentUser) {
                this.showPage('dashboard');
            } else {
                this.showModal('signupModal');
            }
        });

        document.getElementById('heroTryDemo')?.addEventListener('click', () => {
            this.isDemo = true;
            this.showPage('builder');
        });

        document.getElementById('ctaGetStarted')?.addEventListener('click', () => {
            if (this.currentUser) {
                this.showPage('dashboard');
            } else {
                this.showModal('signupModal');
            }
        });

        document.getElementById('ctaTryDemo')?.addEventListener('click', () => {
            this.isDemo = true;
            this.showPage('builder');
        });

        // Dashboard actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const action = e.target.closest('.action-btn').getAttribute('data-action');
                this.handleDashboardAction(action);
            }
        });

        // Modal handling
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close')) {
                const modalId = e.target.getAttribute('data-modal');
                this.hideModal(modalId);
            }
            if (e.target.classList.contains('modal-overlay')) {
                this.hideAllModals();
            }
        });

        // Switch between login/signup
        document.getElementById('switchToSignup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('signupModal');
        });

        document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('signupModal');
            this.showModal('loginModal');
        });

        // Form submissions
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signupForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Google auth
        document.getElementById('loginGoogleBtn')?.addEventListener('click', () => {
            this.signInWithGoogle();
        });

        document.getElementById('signupGoogleBtn')?.addEventListener('click', () => {
            this.signInWithGoogle();
        });

        // Circuit builder events
        this.setupCircuitBuilderEvents();
    }

    setupCircuitBuilderEvents() {
        // Qubit management
        document.getElementById('addQubitBtn')?.addEventListener('click', () => {
            this.addQubit();
        });

        document.getElementById('removeQubitBtn')?.addEventListener('click', () => {
            this.removeQubit();
        });

        // History management
        document.getElementById('undoBtn')?.addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('redoBtn')?.addEventListener('click', () => {
            this.redo();
        });

        document.getElementById('clearBtn')?.addEventListener('click', () => {
            this.clearCircuit();
        });

        // Simulation and export
        document.getElementById('simulateBtn')?.addEventListener('click', () => {
            this.simulateCircuit();
        });

        document.getElementById('exportCodeBtn')?.addEventListener('click', () => {
            this.exportCode();
        });

        document.getElementById('saveCircuitBtn')?.addEventListener('click', () => {
            this.saveCircuit();
        });

        // Language selection
        document.getElementById('exportLanguageSelect')?.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            if (this.circuit.length > 0) {
                this.generateCode(); // Update code display
            }
        });

        // Difficulty filter
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const filter = e.target.getAttribute('data-filter');
                this.setDifficultyFilter(filter);
            }
        });

        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            }
        });

        // Code import
        document.getElementById('importCodeBtn')?.addEventListener('click', () => {
            this.importCode();
        });

        document.getElementById('clearImportBtn')?.addEventListener('click', () => {
            document.getElementById('importCodeArea').value = '';
            document.getElementById('importStatus').innerHTML = '';
        });

        // Gate parameter editing
        document.getElementById('saveParametersBtn')?.addEventListener('click', () => {
            this.saveGateParameters();
        });

        // Angle presets
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('preset-btn')) {
                const angle = e.target.getAttribute('data-angle');
                document.getElementById('gateAngle').value = angle;
            }
        });
    }

    // ==========================================
    // AUTHENTICATION
    // ==========================================
    
    checkAuthState() {
        if (this.auth) {
            this.auth.onAuthStateChanged((user) => {
                if (user) {
                    this.currentUser = user;
                    this.updateNavigation(true);
                    this.updateUserProfile();
                    this.loadUserStats();
                } else {
                    this.currentUser = null;
                    this.updateNavigation(false);
                }
            });
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            this.showLoading('Signing in...');
            await this.auth.signInWithEmailAndPassword(email, password);
            this.hideModal('loginModal');
            this.showToastAsPopup('Welcome back!', 'success');
            this.showPage('dashboard');
        } catch (error) {
            this.showToastAsPopup(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleSignup() {
        const firstName = document.getElementById('signupFirstName').value;
        const lastName = document.getElementById('signupLastName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        if (!agreeTerms) {
            this.showToastAsPopup('Please agree to the Terms of Service', 'error');
            return;
        }

        try {
            this.showLoading('Creating account...');
            const result = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Update user profile
            await result.user.updateProfile({
                displayName: `${firstName} ${lastName}`
            });

            // Create user document in Firestore
            if (this.db) {
                await this.db.collection('users').doc(result.user.uid).set({
                    firstName,
                    lastName,
                    email,
                    displayName: `${firstName} ${lastName}`,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    stats: {
                        circuitsCreated: 0,
                        gatesUsed: 0,
                        simulationsRun: 0,
                        codeExports: 0
                    }
                });
            }

            this.hideModal('signupModal');
            this.showToastAsPopup('Account created successfully!', 'success');
            this.showPage('dashboard');
        } catch (error) {
            this.showToastAsPopup(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async signInWithGoogle() {
        try {
            this.showLoading('Signing in with Google...');
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            
            // Check if this is a new user
            if (result.additionalUserInfo.isNewUser && this.db) {
                await this.db.collection('users').doc(result.user.uid).set({
                    firstName: result.user.displayName?.split(' ')[0] || '',
                    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                    email: result.user.email,
                    displayName: result.user.displayName || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    stats: {
                        circuitsCreated: 0,
                        gatesUsed: 0,
                        simulationsRun: 0,
                        codeExports: 0
                    }
                });
            }

            this.hideAllModals();
            this.showToastAsPopup('Welcome!', 'success');
            this.showPage('dashboard');
        } catch (error) {
            this.showToastAsPopup(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            this.showToastAsPopup('Signed out successfully', 'success');
            this.showPage('home');
        } catch (error) {
            this.showToastAsPopup(error.message, 'error');
        }
    }

    updateNavigation(isLoggedIn) {
        const publicNav = document.getElementById('publicNav');
        const privateNav = document.getElementById('privateNav');
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');

        if (isLoggedIn) {
            publicNav?.classList.add('hidden');
            privateNav?.classList.remove('hidden');
            authButtons?.classList.add('hidden');
            userMenu?.classList.remove('hidden');
        } else {
            publicNav?.classList.remove('hidden');
            privateNav?.classList.add('hidden');
            authButtons?.classList.remove('hidden');
            userMenu?.classList.add('hidden');
        }
    }

    updateUserProfile() {
        if (this.currentUser) {
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');
            const userAvatar = document.getElementById('userAvatar');
            const dashboardUserName = document.getElementById('dashboardUserName');

            if (userName) userName.textContent = this.currentUser.displayName || 'User';
            if (userEmail) userEmail.textContent = this.currentUser.email || '';
            if (userAvatar) userAvatar.textContent = (this.currentUser.displayName || 'U')[0].toUpperCase();
            if (dashboardUserName) dashboardUserName.textContent = this.currentUser.displayName?.split(' ')[0] || 'User';
        }
    }

    async loadUserStats() {
        if (this.currentUser && this.db) {
            try {
                const doc = await this.db.collection('users').doc(this.currentUser.uid).get();
                if (doc.exists) {
                    const data = doc.data();
                    this.userStats = data.stats || this.userStats;
                    this.updateStatsDisplay();
                }
            } catch (error) {
                console.error('Error loading user stats:', error);
            }
        }
    }

    async updateUserStats(statsUpdate) {
        if (this.currentUser && this.db) {
            try {
                const userRef = this.db.collection('users').doc(this.currentUser.uid);
                await userRef.update({
                    [`stats.${Object.keys(statsUpdate)[0]}`]: firebase.firestore.FieldValue.increment(Object.values(statsUpdate)[0])
                });
                
                // Update local stats
                Object.keys(statsUpdate).forEach(key => {
                    this.userStats[key] += statsUpdate[key];
                });
                
                this.updateStatsDisplay();
            } catch (error) {
                console.error('Error updating user stats:', error);
            }
        }
    }

    updateStatsDisplay() {
        document.getElementById('statsCircuits').textContent = this.userStats.circuitsCreated;
        document.getElementById('statsGates').textContent = this.userStats.gatesUsed;
        document.getElementById('statsSimulations').textContent = this.userStats.simulationsRun;
        document.getElementById('statsExports').textContent = this.userStats.codeExports;
    }"""

# Save first part of app.js
with open(f"{project_name}/app_part1.js", "w") as f:
    f.write(app_js_part1)

print(f"✅ Created {project_name}/app_part1.js")