import zipfile
import os
from datetime import datetime

# Create the complete quantum platform project structure
project_name = "quantum-circuit-builder-complete"

# Create the main project directory
os.makedirs(project_name, exist_ok=True)

# 1. Main index.html - Complete with all features
index_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quantum Computing Platform - Professional Circuit Builder</title>
    <link rel="stylesheet" href="style.css">
    
    <!-- Chart.js for probability charts -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- Three.js for Bloch sphere -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.155.0/examples/js/controls/OrbitControls.js"></script>
    
    <!-- Firebase -->
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
    
    <!-- Prism.js for syntax highlighting -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-clike.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-cpp.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-csharp.min.js"></script>
    
    <!-- MongoDB Realm Web SDK -->
    <script src="https://unpkg.com/realm-web@2.0.0/dist/bundle.iife.js"></script>
</head>
<body class="theme-light">
    <div id="app">
        <!-- Navigation -->
        <nav class="navbar" id="navbar">
            <div class="navbar-content container">
                <div class="navbar-brand">
                    <div class="quantum-logo">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2" fill="none"/>
                            <circle cx="16" cy="8" r="2" fill="currentColor"/>
                            <circle cx="8" cy="20" r="2" fill="currentColor"/>
                            <circle cx="24" cy="20" r="2" fill="currentColor"/>
                            <path d="M16 10L8 18M16 10L24 18M8 18L24 18" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                    </div>
                    <span class="navbar-title">Quantum Platform</span>
                </div>

                <div class="navbar-nav" id="navbarNav">
                    <div class="nav-links" id="publicNav">
                        <a href="#" class="nav-link active" data-page="home">Home</a>
                        <a href="#" class="nav-link" data-page="features">Features</a>
                        <a href="#" class="nav-link" data-page="docs">Docs</a>
                    </div>
                    
                    <div class="nav-links hidden" id="privateNav">
                        <a href="#" class="nav-link" data-page="dashboard">Dashboard</a>
                        <a href="#" class="nav-link" data-page="builder">Circuit Builder</a>
                        <a href="#" class="nav-link" data-page="circuits">My Circuits</a>
                    </div>
                </div>

                <div class="navbar-actions">
                    <!-- Theme Toggle -->
                    <button class="theme-toggle" id="themeToggle" title="Toggle theme">
                        <span class="theme-icon light-icon">☀️</span>
                        <span class="theme-icon dark-icon">🌙</span>
                    </button>
                    
                    <div class="auth-buttons" id="authButtons">
                        <button class="btn btn-ghost" id="loginBtn">Login</button>
                        <button class="btn btn-primary" id="signupBtn">Sign Up</button>
                    </div>
                    
                    <div class="user-menu hidden" id="userMenu">
                        <div class="user-avatar" id="userAvatar">U</div>
                        <div class="user-dropdown" id="userDropdown">
                            <div class="user-info">
                                <div class="user-name" id="userName">User Name</div>
                                <div class="user-email" id="userEmail">user@example.com</div>
                            </div>
                            <hr>
                            <button class="dropdown-item" id="settingsBtn">Settings</button>
                            <button class="dropdown-item" id="logoutBtn">Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Pages Container -->
        <main id="pageContainer">
            <!-- Home/Welcome Page -->
            <div class="page" id="homePage">
                <section class="hero">
                    <div class="hero-background">
                        <div class="quantum-particles"></div>
                    </div>
                    <div class="hero-content container">
                        <div class="hero-text">
                            <h1 class="hero-title">
                                Build <span class="gradient-text">Quantum</span> Circuits
                                <br>Export to Any Language
                            </h1>
                            <p class="hero-subtitle">
                                The most comprehensive quantum circuit builder for education, research, and development. 
                                Create quantum algorithms visually and export to Qiskit, Cirq, Q#, and 8+ more languages.
                            </p>
                            <div class="hero-buttons">
                                <button class="btn btn-primary btn-large" id="heroGetStarted">
                                    Get Started Free
                                </button>
                                <button class="btn btn-outline btn-large" id="heroTryDemo">
                                    Try Live Demo
                                </button>
                            </div>
                        </div>
                        <div class="hero-visual">
                            <div class="quantum-circuit-preview">
                                <svg width="300" height="200" viewBox="0 0 300 200">
                                    <defs>
                                        <linearGradient id="quantumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
                                            <stop offset="100%" style="stop-color:#38bdf8;stop-opacity:1" />
                                        </linearGradient>
                                    </defs>
                                    <line x1="30" y1="60" x2="270" y2="60" stroke="url(#quantumGradient)" stroke-width="2"/>
                                    <line x1="30" y1="100" x2="270" y2="100" stroke="url(#quantumGradient)" stroke-width="2"/>
                                    <line x1="30" y1="140" x2="270" y2="140" stroke="url(#quantumGradient)" stroke-width="2"/>
                                    <rect x="65" y="45" width="30" height="30" rx="5" fill="var(--primary)" opacity="0.8"/>
                                    <text x="80" y="65" fill="white" text-anchor="middle" font-weight="bold">H</text>
                                    <rect x="125" y="85" width="30" height="30" rx="5" fill="var(--primary)" opacity="0.8"/>
                                    <text x="140" y="105" fill="white" text-anchor="middle" font-weight="bold">X</text>
                                    <circle cx="200" cy="60" r="4" fill="var(--primary)"/>
                                    <line x1="200" y1="60" x2="200" y2="140" stroke="var(--primary)" stroke-width="2"/>
                                    <circle cx="200" cy="140" r="15" fill="none" stroke="var(--primary)" stroke-width="2"/>
                                    <line x1="192" y1="140" x2="208" y2="140" stroke="var(--primary)" stroke-width="2"/>
                                    <line x1="200" y1="132" x2="200" y2="148" stroke="var(--primary)" stroke-width="2"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="features" id="features">
                    <div class="container">
                        <div class="section-header">
                            <h2 class="section-title">Everything You Need for Quantum Computing</h2>
                            <p class="section-subtitle">Professional tools for quantum algorithm development and education</p>
                        </div>
                        
                        <div class="features-grid">
                            <div class="feature-card">
                                <div class="feature-icon">🎨</div>
                                <h3 class="feature-title">Visual Circuit Builder</h3>
                                <p class="feature-description">Intuitive drag-and-drop interface with beginner-friendly gates and advanced quantum operations</p>
                            </div>
                            
                            <div class="feature-card">
                                <div class="feature-icon">🔤</div>
                                <h3 class="feature-title">8+ Programming Languages</h3>
                                <p class="feature-description">Export to Qiskit, Cirq, Q#, OpenQASM, Braket, Quil, PennyLane, and XACC</p>
                            </div>
                            
                            <div class="feature-card">
                                <div class="feature-icon">⚛️</div>
                                <h3 class="feature-title">Real Quantum Simulation</h3>
                                <p class="feature-description">Accurate quantum state calculation with probability charts and Bloch sphere visualization</p>
                            </div>
                            
                            <div class="feature-card">
                                <div class="feature-icon">☁️</div>
                                <h3 class="feature-title">Cloud Storage</h3>
                                <p class="feature-description">Save circuits to MongoDB Atlas with Firebase authentication and real-time sync</p>
                            </div>
                            
                            <div class="feature-card">
                                <div class="feature-icon">📱</div>
                                <h3 class="feature-title">Responsive Design</h3>
                                <p class="feature-description">Works seamlessly on desktop, tablet, and mobile with touch-friendly controls</p>
                            </div>
                            
                            <div class="feature-card">
                                <div class="feature-icon">🌓</div>
                                <h3 class="feature-title">Light & Dark Themes</h3>
                                <p class="feature-description">Professional themes with instant switching and user preference persistence</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="cta">
                    <div class="container">
                        <div class="cta-content">
                            <h2 class="cta-title">Ready to Start Your Quantum Journey?</h2>
                            <p class="cta-subtitle">Join thousands of students, researchers, and quantum enthusiasts</p>
                            <div class="cta-buttons">
                                <button class="btn btn-primary btn-large" id="ctaGetStarted">
                                    Create Free Account
                                </button>
                                <button class="btn btn-outline btn-large" id="ctaTryDemo">
                                    Try Without Signup
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Dashboard Page -->
            <div class="page hidden" id="dashboardPage">
                <div class="dashboard-container container">
                    <div class="dashboard-header">
                        <h1 class="page-title">Welcome back, <span id="dashboardUserName">User</span>!</h1>
                        <p class="page-subtitle">Your quantum computing workspace</p>
                    </div>
                    
                    <div class="dashboard-grid">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon">⚛️</div>
                                <div class="stat-content">
                                    <div class="stat-value" id="statsCircuits">0</div>
                                    <div class="stat-label">Circuits Created</div>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">🚪</div>
                                <div class="stat-content">
                                    <div class="stat-value" id="statsGates">0</div>
                                    <div class="stat-label">Gates Used</div>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">🔬</div>
                                <div class="stat-content">
                                    <div class="stat-value" id="statsSimulations">0</div>
                                    <div class="stat-label">Simulations Run</div>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">📁</div>
                                <div class="stat-content">
                                    <div class="stat-value" id="statsExports">0</div>
                                    <div class="stat-label">Code Exports</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="quick-actions">
                            <h2 class="section-title">Quick Actions</h2>
                            <div class="actions-grid">
                                <button class="action-btn" data-action="new-circuit">
                                    <div class="action-icon">➕</div>
                                    <div class="action-content">
                                        <div class="action-title">New Circuit</div>
                                        <div class="action-desc">Start building</div>
                                    </div>
                                </button>
                                
                                <button class="action-btn" data-action="import-code">
                                    <div class="action-icon">📁</div>
                                    <div class="action-content">
                                        <div class="action-title">Import Code</div>
                                        <div class="action-desc">From Qiskit, OpenQASM</div>
                                    </div>
                                </button>
                                
                                <button class="action-btn" data-action="templates">
                                    <div class="action-icon">📚</div>
                                    <div class="action-content">
                                        <div class="action-title">Templates</div>
                                        <div class="action-desc">Algorithm examples</div>
                                    </div>
                                </button>
                                
                                <button class="action-btn" data-action="community">
                                    <div class="action-icon">👥</div>
                                    <div class="action-content">
                                        <div class="action-title">Community</div>
                                        <div class="action-desc">Shared circuits</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        
                        <div class="recent-circuits">
                            <div class="section-header">
                                <h2 class="section-title">Recent Circuits</h2>
                                <button class="btn btn-ghost" id="viewAllCircuits">View All</button>
                            </div>
                            <div class="circuits-list" id="recentCircuitsList">
                                <div class="empty-state">
                                    <div class="empty-icon">⚛️</div>
                                    <p>No circuits yet. Create your first quantum circuit!</p>
                                    <button class="btn btn-primary" data-action="new-circuit">Get Started</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Circuit Builder Page -->
            <div class="page hidden" id="builderPage">
                <div class="circuit-builder">
                    <div class="circuit-toolbar">
                        <div class="toolbar-group">
                            <button class="btn btn-icon" id="addQubitBtn" title="Add qubit">
                                <span>+</span>
                            </button>
                            <span class="toolbar-label">Qubits: <span id="qubitCount">3</span></span>
                            <button class="btn btn-icon" id="removeQubitBtn" title="Remove qubit">
                                <span>-</span>
                            </button>
                        </div>
                        
                        <div class="toolbar-group">
                            <button class="btn btn-icon" id="undoBtn" title="Undo">
                                <span>↶</span>
                            </button>
                            <button class="btn btn-icon" id="redoBtn" title="Redo">
                                <span>↷</span>
                            </button>
                            <button class="btn btn-icon" id="clearBtn" title="Clear circuit">
                                <span>🗑</span>
                            </button>
                        </div>
                        
                        <div class="toolbar-group">
                            <button class="btn btn-primary" id="simulateBtn">
                                ⚡ Simulate
                            </button>
                            <button class="btn btn-outline" id="saveCircuitBtn">
                                💾 Save
                            </button>
                        </div>
                        
                        <div class="toolbar-group">
                            <select class="form-select" id="exportLanguageSelect">
                                <option value="qiskit">Qiskit (Python)</option>
                                <option value="qasm">OpenQASM 2.0</option>
                                <option value="cirq">Cirq (Python)</option>
                                <option value="qsharp">Q# (Microsoft)</option>
                                <option value="braket">Braket (AWS)</option>
                                <option value="quil">Quil (Rigetti)</option>
                                <option value="pennylane">PennyLane</option>
                                <option value="xacc">XACC (C++)</option>
                            </select>
                            <button class="btn btn-outline" id="exportCodeBtn">
                                📄 Export
                            </button>
                        </div>
                    </div>

                    <div class="builder-content">
                        <div class="gate-palette">
                            <div class="palette-header">
                                <h3>Quantum Gates</h3>
                                <div class="difficulty-filter">
                                    <button class="filter-btn active" data-filter="all">All</button>
                                    <button class="filter-btn" data-filter="beginner">Beginner</button>
                                    <button class="filter-btn" data-filter="advanced">Advanced</button>
                                </div>
                            </div>
                            
                            <div class="gate-categories">
                                <div class="gate-category">
                                    <h4>Single Qubit</h4>
                                    <div class="gate-grid" id="singleQubitGates"></div>
                                </div>
                                
                                <div class="gate-category">
                                    <h4>Rotations</h4>
                                    <div class="gate-grid" id="rotationGates"></div>
                                </div>
                                
                                <div class="gate-category">
                                    <h4>Two Qubit</h4>
                                    <div class="gate-grid" id="twoQubitGates"></div>
                                </div>
                                
                                <div class="gate-category">
                                    <h4>Measurement</h4>
                                    <div class="gate-grid" id="measurementGates"></div>
                                </div>
                            </div>
                        </div>

                        <div class="circuit-canvas-container">
                            <div class="canvas-header">
                                <h3>Quantum Circuit</h3>
                                <div class="canvas-info" id="circuitInfo">3 qubits, 0 gates</div>
                            </div>
                            <div class="circuit-canvas" id="circuitCanvas"></div>
                        </div>

                        <div class="results-panel">
                            <div class="results-tabs">
                                <button class="tab-btn active" data-tab="code">Code</button>
                                <button class="tab-btn" data-tab="probability">Probability</button>
                                <button class="tab-btn" data-tab="bloch">Bloch Sphere</button>
                                <button class="tab-btn" data-tab="import">Import</button>
                            </div>
                            
                            <div class="tab-content">
                                <div class="tab-panel active" id="codeTab">
                                    <div class="code-editor" id="codeEditor">
                                        <pre><code>// Generated code will appear here after simulation</code></pre>
                                    </div>
                                </div>
                                
                                <div class="tab-panel" id="probabilityTab">
                                    <div class="chart-container">
                                        <canvas id="probabilityChart"></canvas>
                                    </div>
                                </div>
                                
                                <div class="tab-panel" id="blochTab">
                                    <div class="bloch-container">
                                        <div class="bloch-sphere" id="blochSphere"></div>
                                        <div class="bloch-info" id="blochInfo">
                                            <h4>Qubit States</h4>
                                            <div id="qubitStates"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="tab-panel" id="importTab">
                                    <div class="import-section">
                                        <div class="import-header">
                                            <h4>Import Quantum Code</h4>
                                            <select class="form-select" id="importLanguageSelect">
                                                <option value="qiskit">Qiskit (Python)</option>
                                                <option value="qasm">OpenQASM 2.0</option>
                                                <option value="cirq">Cirq (Python)</option>
                                                <option value="qsharp">Q# (Microsoft)</option>
                                                <option value="quil">Quil (Rigetti)</option>
                                            </select>
                                        </div>
                                        <textarea class="code-textarea" id="importCodeArea" placeholder="Paste your quantum code here..."></textarea>
                                        <div class="import-actions">
                                            <button class="btn btn-primary" id="importCodeBtn">Import & Build Circuit</button>
                                            <button class="btn btn-ghost" id="clearImportBtn">Clear</button>
                                        </div>
                                        <div class="import-status" id="importStatus"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Modals -->
        <div class="modal-overlay hidden" id="modalOverlay">
            <!-- Login Modal -->
            <div class="modal hidden" id="loginModal">
                <div class="modal-header">
                    <h2>Welcome Back</h2>
                    <button class="modal-close" data-modal="loginModal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginEmail">Email</label>
                            <input type="email" id="loginEmail" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" class="form-input" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Sign In</button>
                    </form>
                    <div class="modal-divider">or</div>
                    <button class="btn btn-outline btn-full" id="loginGoogleBtn">
                        <span>🔍</span> Continue with Google
                    </button>
                    <div class="modal-footer">
                        <p>Don't have an account? <a href="#" id="switchToSignup">Sign up</a></p>
                    </div>
                </div>
            </div>

            <!-- Signup Modal -->
            <div class="modal hidden" id="signupModal">
                <div class="modal-header">
                    <h2>Create Account</h2>
                    <button class="modal-close" data-modal="signupModal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="signupForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="signupFirstName">First Name</label>
                                <input type="text" id="signupFirstName" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label for="signupLastName">Last Name</label>
                                <input type="text" id="signupLastName" class="form-input">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="signupEmail">Email</label>
                            <input type="email" id="signupEmail" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="signupPassword">Password</label>
                            <input type="password" id="signupPassword" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="agreeTerms" required>
                                <span class="checkmark"></span>
                                I agree to the Terms of Service and Privacy Policy
                            </label>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Create Account</button>
                    </form>
                    <div class="modal-divider">or</div>
                    <button class="btn btn-outline btn-full" id="signupGoogleBtn">
                        <span>🔍</span> Sign up with Google
                    </button>
                    <div class="modal-footer">
                        <p>Already have an account? <a href="#" id="switchToLogin">Sign in</a></p>
                    </div>
                </div>
            </div>

            <!-- Gate Parameter Modal -->
            <div class="modal hidden" id="gateParameterModal">
                <div class="modal-header">
                    <h2 id="parameterModalTitle">Edit Gate Parameters</h2>
                    <button class="modal-close" data-modal="gateParameterModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="gateAngle">Rotation Angle (radians)</label>
                        <input type="number" id="gateAngle" class="form-input" step="0.1" value="1.5708">
                        <div class="angle-presets">
                            <button class="preset-btn" data-angle="1.5708">π/2</button>
                            <button class="preset-btn" data-angle="3.14159">π</button>
                            <button class="preset-btn" data-angle="4.71239">3π/2</button>
                            <button class="preset-btn" data-angle="6.28318">2π</button>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-ghost" data-modal="gateParameterModal">Cancel</button>
                        <button class="btn btn-primary" id="saveParametersBtn">Save</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading Overlay -->
        <div class="loading-overlay hidden" id="loadingOverlay">
            <div class="loading-spinner"></div>
            <p class="loading-text" id="loadingText">Loading...</p>
        </div>

        <!-- Toast Notifications -->
        <div class="toast-container" id="toastContainer"></div>
    </div>

    <script src="app.js"></script>
</body>
</html>"""

# Save the main index.html
with open(f"{project_name}/index.html", "w") as f:
    f.write(index_html)

print(f"✅ Created {project_name}/index.html")