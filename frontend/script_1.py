# 2. Complete CSS with Light/Dark Theme Support
style_css = """/* Quantum Platform - Enhanced Styles with Light/Dark Theme Support */

:root {
  /* Base Colors */
  --quantum-primary: #7c3aed;
  --quantum-secondary: #38bdf8;
  --quantum-accent: #06b6d4;
  --quantum-success: #10b981;
  --quantum-warning: #f59e0b;
  --quantum-error: #ef4444;
  
  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}

/* Dark Theme (Default) */
.theme-dark {
  --background: #0f172a;
  --surface: #1e293b;
  --surface-variant: #334155;
  --border: #475569;
  --text: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --primary: var(--quantum-primary);
  --secondary: var(--quantum-secondary);
  --accent: var(--quantum-accent);
  --success: var(--quantum-success);
  --warning: var(--quantum-warning);
  --error: var(--quantum-error);
}

/* Light Theme */
.theme-light {
  --background: #ffffff;
  --surface: #f8fafc;
  --surface-variant: #f1f5f9;
  --border: #e2e8f0;
  --text: #1e293b;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --primary: var(--quantum-primary);
  --secondary: var(--quantum-secondary);
  --accent: var(--quantum-accent);
  --success: var(--quantum-success);
  --warning: var(--quantum-warning);
  --error: var(--quantum-error);
}

/* Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  background: var(--background);
  color: var(--text);
  line-height: 1.6;
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.2;
  color: var(--text);
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #7c3aed;
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.btn-outline {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.btn-outline:hover:not(:disabled) {
  background: var(--primary);
  color: white;
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--surface-variant);
  color: var(--text);
}

.btn-icon {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.btn-icon:hover:not(:disabled) {
  background: var(--surface-variant);
  color: var(--text);
}

.btn-large {
  padding: var(--space-lg) var(--space-2xl);
  font-size: 1rem;
}

.btn-full {
  width: 100%;
}

/* Forms */
.form-group {
  margin-bottom: var(--space-lg);
}

.form-row {
  display: flex;
  gap: var(--space-md);
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: var(--space-sm);
  font-weight: 500;
  color: var(--text);
}

.form-input,
.form-select,
.code-textarea {
  width: 100%;
  padding: var(--space-md);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text);
  font-family: inherit;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus,
.form-select:focus,
.code-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.code-textarea {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  min-height: 200px;
  resize: vertical;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 400;
}

.checkbox-label input[type="checkbox"] {
  margin-right: var(--space-sm);
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  transition: background-color var(--transition-normal);
}

.theme-light .navbar {
  background: rgba(255, 255, 255, 0.8);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--text);
  text-decoration: none;
}

.quantum-logo svg {
  color: var(--primary);
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--space-2xl);
}

.nav-links {
  display: flex;
  gap: var(--space-lg);
}

.nav-link {
  padding: var(--space-sm) var(--space-md);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary);
  background: rgba(14, 165, 233, 0.1);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.theme-toggle {
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background: var(--surface-variant);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  overflow: hidden;
}

.theme-toggle::before {
  content: '';
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  background: var(--primary);
  border-radius: 50%;
  transition: transform var(--transition-normal);
}

.theme-light .theme-toggle::before {
  transform: translateX(1.5rem);
}

.theme-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  transition: opacity var(--transition-fast);
}

.light-icon {
  left: 0.25rem;
  opacity: 0;
}

.dark-icon {
  right: 0.25rem;
  opacity: 1;
}

.theme-light .light-icon {
  opacity: 1;
}

.theme-light .dark-icon {
  opacity: 0;
}

.user-menu {
  position: relative;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--space-sm);
  width: 200px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-fast);
}

.user-menu:hover .user-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-info {
  padding: var(--space-lg);
}

.user-name {
  font-weight: 600;
  color: var(--text);
}

.user-email {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: var(--space-md) var(--space-lg);
  background: none;
  border: none;
  color: var(--text-secondary);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--surface-variant);
  color: var(--text);
}

/* Pages */
.page {
  padding-top: 4rem;
  min-height: 100vh;
}

.page.hidden {
  display: none;
}

/* Hero Section */
.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%);
  opacity: 0.05;
}

.theme-light .hero-background {
  opacity: 0.03;
}

.quantum-particles {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, var(--primary), transparent),
    radial-gradient(2px 2px at 40px 70px, var(--secondary), transparent),
    radial-gradient(1px 1px at 90px 40px, var(--accent), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: particles 20s linear infinite;
  opacity: 0.3;
}

@keyframes particles {
  from { transform: translateY(0); }
  to { transform: translateY(-200px); }
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: var(--space-lg);
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-2xl);
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.quantum-circuit-preview {
  padding: var(--space-2xl);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
}

/* Features Section */
.features {
  padding: var(--space-2xl) 0;
  background: var(--surface);
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
}

.section-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-xl);
}

.feature-card {
  padding: var(--space-xl);
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  transition: all var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: var(--space-lg);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-sm);
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* CTA Section */
.cta {
  padding: var(--space-2xl) 0;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
}

.cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
}

.cta-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  margin-bottom: var(--space-xl);
}

.cta-buttons {
  display: flex;
  gap: var(--space-lg);
  justify-content: center;
  flex-wrap: wrap;
}

.cta .btn-outline {
  border-color: white;
  color: white;
}

.cta .btn-outline:hover {
  background: white;
  color: var(--primary);
}

/* Dashboard */
.dashboard-container {
  padding: var(--space-2xl) 0;
}

.dashboard-header {
  margin-bottom: var(--space-2xl);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.dashboard-grid {
  display: grid;
  gap: var(--space-2xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-xl);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.quick-actions {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--surface-variant);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 1.5rem;
}

.action-title {
  font-weight: 600;
  color: var(--text);
}

.action-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.recent-circuits {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
}

.recent-circuits .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  margin-bottom: var(--space-lg);
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
  margin-bottom: var(--space-lg);
}

/* Circuit Builder */
.circuit-builder {
  min-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
}

.circuit-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.toolbar-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.builder-content {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  flex: 1;
  min-height: 0;
}

.gate-palette {
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: var(--space-lg);
  overflow-y: auto;
}

.palette-header {
  margin-bottom: var(--space-lg);
}

.palette-header h3 {
  margin-bottom: var(--space-md);
}

.difficulty-filter {
  display: flex;
  gap: var(--space-xs);
}

.filter-btn {
  padding: var(--space-xs) var(--space-sm);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-btn.active,
.filter-btn:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.gate-category {
  margin-bottom: var(--space-lg);
}

.gate-category h4 {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.gate-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.gate-tile {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: grab;
  transition: all var(--transition-fast);
  user-select: none;
}

.gate-tile:hover {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
  transform: scale(1.05);
}

.gate-tile:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.gate-tile.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.circuit-canvas-container {
  padding: var(--space-lg);
  background: var(--background);
  overflow: auto;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.canvas-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.circuit-canvas {
  min-height: 400px;
  background: var(--surface);
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: auto;
}

.circuit-canvas.drag-over {
  border-color: var(--primary);
  background: rgba(14, 165, 233, 0.05);
}

.circuit-grid {
  display: grid;
  grid-template-rows: repeat(var(--qubits, 3), 60px);
  grid-template-columns: repeat(var(--depth, 8), 80px);
  gap: 1px;
  padding: var(--space-lg);
}

.qubit-line {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  position: relative;
}

.qubit-line::before {
  content: '';
  position: absolute;
  left: 40px;
  right: 40px;
  height: 2px;
  background: var(--primary);
  opacity: 0.6;
}

.qubit-label {
  width: 40px;
  text-align: center;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--surface);
  z-index: 1;
}

.gate-position {
  width: 60px;
  height: 50px;
  background: transparent;
  border: 2px dashed transparent;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  position: relative;
  z-index: 2;
}

.gate-position.drop-target {
  border-color: var(--primary);
  background: rgba(14, 165, 233, 0.1);
}

.gate-position.occupied {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  font-weight: 600;
  cursor: grab;
}

.gate-position.occupied:hover {
  background: #7c3aed;
  transform: scale(1.05);
}

.results-panel {
  background: var(--surface);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.results-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  flex: 1;
  padding: var(--space-md);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.875rem;
}

.tab-btn.active {
  color: var(--primary);
  border-bottom: 2px solid var(--primary);
  background: var(--surface-variant);
}

.tab-btn:hover:not(.active) {
  background: var(--surface-variant);
  color: var(--text);
}

.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tab-panel {
  flex: 1;
  padding: var(--space-lg);
  display: none;
}

.tab-panel.active {
  display: block;
}

.code-editor {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bloch-container {
  display: grid;
  grid-template-rows: 1fr auto;
  height: 400px;
  gap: var(--space-md);
}

.bloch-sphere {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bloch-info h4 {
  margin-bottom: var(--space-sm);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.import-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

.import-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.import-header h4 {
  margin: 0;
}

.import-actions {
  display: flex;
  gap: var(--space-sm);
}

.import-status {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
}

.import-status.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.import-status.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.import-status.info {
  background: rgba(14, 165, 233, 0.1);
  color: var(--primary);
  border: 1px solid rgba(14, 165, 233, 0.2);
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  backdrop-filter: blur(4px);
}

.modal-overlay.hidden {
  display: none;
}

.modal {
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  animation: modalEnter 0.2s ease;
}

.modal.hidden {
  display: none;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xl) var(--space-xl) 0;
  margin-bottom: var(--space-lg);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--surface-variant);
  color: var(--text);
}

.modal-body {
  padding: 0 var(--space-xl) var(--space-xl);
}

.modal-divider {
  text-align: center;
  margin: var(--space-lg) 0;
  color: var(--text-muted);
  position: relative;
}

.modal-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border);
  z-index: -1;
}

.modal-divider {
  background: var(--surface);
  padding: 0 var(--space-md);
}

.modal-footer {
  text-align: center;
  margin-top: var(--space-lg);
}

.modal-footer a {
  color: var(--primary);
  text-decoration: none;
}

.modal-footer a:hover {
  text-decoration: underline;
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  margin-top: var(--space-lg);
}

.angle-presets {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.preset-btn {
  padding: var(--space-xs) var(--space-sm);
  background: var(--surface-variant);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.preset-btn:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Loading */
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.loading-overlay.hidden {
  display: none;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(14, 165, 233, 0.3);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: white;
  margin-top: var(--space-lg);
  font-weight: 500;
}

/* Toasts */
.toast-container {
  position: fixed;
  top: 5rem;
  right: var(--space-lg);
  z-index: 1500;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.toast {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-lg);
  max-width: 300px;
  animation: toastEnter 0.3s ease;
}

@keyframes toastEnter {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast.success {
  border-left: 4px solid var(--success);
}

.toast.error {
  border-left: 4px solid var(--error);
}

.toast.warning {
  border-left: 4px solid var(--warning);
}

.toast.info {
  border-left: 4px solid var(--primary);
}

/* Utilities */
.hidden {
  display: none !important;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .builder-content {
    grid-template-columns: 200px 1fr 250px;
  }
  
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--space-md);
  }
  
  .navbar-nav {
    display: none;
  }
  
  .builder-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
  }
  
  .gate-palette {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  
  .results-panel {
    border-left: none;
    border-top: 1px solid var(--border);
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .cta-title {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-buttons,
  .cta-buttons {
    flex-direction: column;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .circuit-toolbar {
    flex-wrap: wrap;
    gap: var(--space-sm);
  }
  
  .toolbar-group {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .modal {
    margin: var(--space-md);
  }
  
  .toast-container {
    left: var(--space-md);
    right: var(--space-md);
  }
  
  .toast {
    max-width: none;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}"""

# Save the CSS file
with open(f"{project_name}/style.css", "w") as f:
    f.write(style_css)

print(f"✅ Created {project_name}/style.css")