# 4. Continue with app.js part 2
app_js_part2 = """
    // ==========================================
    // PAGE NAVIGATION
    // ==========================================
    
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.add('hidden');
        });

        // Show selected page
        const page = document.getElementById(`${pageId}Page`);
        if (page) {
            page.classList.remove('hidden');
            this.currentPage = pageId;
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            }
        });

        // Initialize page-specific content
        if (pageId === 'builder') {
            this.initializeCircuitBuilder();
        } else if (pageId === 'dashboard') {
            this.loadUserStats();
            this.loadRecentCircuits();
        }
    }

    handleDashboardAction(action) {
        switch (action) {
            case 'new-circuit':
                this.showPage('builder');
                break;
            case 'import-code':
                this.showPage('builder');
                setTimeout(() => this.switchTab('import'), 100);
                break;
            case 'templates':
                this.showPage('builder');
                this.loadAlgorithmTemplate('bell-state');
                break;
            case 'community':
                this.showToastAsPopup('Community features coming soon!', 'info');
                break;
        }
    }

    // ==========================================
    // CIRCUIT BUILDER INITIALIZATION
    // ==========================================
    
    initializeCircuitBuilder() {
        if (this.currentPage !== 'builder') return;

        this.renderGatePalette();
        this.renderCircuitCanvas();
        this.setupDragAndDrop();
        this.updateCircuitInfo();
        this.initializeBlochSphere();
    }

    renderGatePalette() {
        // Render single qubit gates
        const singleQubitContainer = document.getElementById('singleQubitGates');
        if (singleQubitContainer) {
            singleQubitContainer.innerHTML = '';
            this.quantumGates.singleQubit.forEach(gate => {
                if (this.shouldShowGate(gate)) {
                    const gateElement = this.createGateElement(gate);
                    singleQubitContainer.appendChild(gateElement);
                }
            });
        }

        // Render rotation gates
        const rotationContainer = document.getElementById('rotationGates');
        if (rotationContainer) {
            rotationContainer.innerHTML = '';
            this.quantumGates.rotationGates.forEach(gate => {
                if (this.shouldShowGate(gate)) {
                    const gateElement = this.createGateElement(gate);
                    rotationContainer.appendChild(gateElement);
                }
            });
        }

        // Render two qubit gates
        const twoQubitContainer = document.getElementById('twoQubitGates');
        if (twoQubitContainer) {
            twoQubitContainer.innerHTML = '';
            this.quantumGates.twoQubitGates.forEach(gate => {
                if (this.shouldShowGate(gate)) {
                    const gateElement = this.createGateElement(gate);
                    twoQubitContainer.appendChild(gateElement);
                }
            });
        }

        // Render measurement gates
        const measurementContainer = document.getElementById('measurementGates');
        if (measurementContainer) {
            measurementContainer.innerHTML = '';
            this.quantumGates.measurementGates.forEach(gate => {
                if (this.shouldShowGate(gate)) {
                    const gateElement = this.createGateElement(gate);
                    measurementContainer.appendChild(gateElement);
                }
            });
        }
    }

    shouldShowGate(gate) {
        if (!this.isBeginnerMode) return true;
        return gate.beginner;
    }

    createGateElement(gate) {
        const element = document.createElement('div');
        element.className = 'gate-tile';
        element.textContent = gate.symbol;
        element.style.color = gate.color;
        element.title = gate.description;
        element.draggable = true;
        element.setAttribute('data-gate-type', gate.type);
        element.setAttribute('data-gate-name', gate.name);

        // Add drag event listeners
        element.addEventListener('dragstart', (e) => {
            this.handleGateDragStart(e, gate);
        });

        element.addEventListener('dragend', (e) => {
            this.handleGateDragEnd(e);
        });

        return element;
    }

    renderCircuitCanvas() {
        const canvas = document.getElementById('circuitCanvas');
        if (!canvas) return;

        canvas.innerHTML = '';
        
        // Create circuit grid
        const grid = document.createElement('div');
        grid.className = 'circuit-grid';
        grid.style.setProperty('--qubits', this.qubits);
        grid.style.setProperty('--depth', this.maxDepth);

        // Create qubit lines and gate positions
        for (let qubit = 0; qubit < this.qubits; qubit++) {
            // Qubit line
            const qubitLine = document.createElement('div');
            qubitLine.className = 'qubit-line';
            qubitLine.style.gridRow = qubit + 1;
            
            // Qubit label
            const label = document.createElement('div');
            label.className = 'qubit-label';
            label.textContent = `|${qubit}⟩`;
            qubitLine.appendChild(label);

            grid.appendChild(qubitLine);

            // Gate positions
            for (let col = 0; col < this.maxDepth; col++) {
                const position = document.createElement('div');
                position.className = 'gate-position';
                position.style.gridRow = qubit + 1;
                position.style.gridColumn = col + 2; // Offset by 1 for qubit label
                position.setAttribute('data-qubit', qubit);
                position.setAttribute('data-column', col);

                // Check if there's a gate at this position
                const existingGate = this.circuit.find(g => g.qubit === qubit && g.column === col);
                if (existingGate) {
                    position.classList.add('occupied');
                    position.textContent = this.getGateSymbol(existingGate.gate);
                    position.style.backgroundColor = this.getGateColor(existingGate.gate);
                    
                    // Add click handler for gate parameters
                    if (existingGate.gate.startsWith('r')) {
                        position.addEventListener('click', () => {
                            this.editGateParameters(existingGate);
                        });
                    }

                    // Add drag handler to move gates
                    position.draggable = true;
                    position.addEventListener('dragstart', (e) => {
                        this.handleGateMoveDragStart(e, existingGate);
                    });
                }

                grid.appendChild(position);
            }
        }

        canvas.appendChild(grid);
        this.setupCanvasDragAndDrop();
    }

    // ==========================================
    // DRAG AND DROP SYSTEM
    // ==========================================
    
    setupDragAndDrop() {
        // This is handled in renderGatePalette and renderCircuitCanvas
    }

    setupCanvasDragAndDrop() {
        const canvas = document.getElementById('circuitCanvas');
        if (!canvas) return;

        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            canvas.classList.add('drag-over');
        });

        canvas.addEventListener('dragleave', (e) => {
            if (!canvas.contains(e.relatedTarget)) {
                canvas.classList.remove('drag-over');
            }
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.classList.remove('drag-over');
            this.handleCanvasDrop(e);
        });

        // Setup drop zones for individual positions
        document.querySelectorAll('.gate-position').forEach(position => {
            position.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!position.classList.contains('occupied')) {
                    position.classList.add('drop-target');
                }
            });

            position.addEventListener('dragleave', (e) => {
                position.classList.remove('drop-target');
            });

            position.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                position.classList.remove('drop-target');
                this.handlePositionDrop(e, position);
            });
        });
    }

    handleGateDragStart(e, gate) {
        this.draggedElement = { type: 'new-gate', gate: gate };
        e.dataTransfer.effectAllowed = 'copy';
        e.target.classList.add('dragging');
    }

    handleGateDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
    }

    handleGateMoveDragStart(e, gateInfo) {
        this.draggedElement = { type: 'move-gate', gate: gateInfo };
        e.dataTransfer.effectAllowed = 'move';
    }

    handleCanvasDrop(e) {
        // If dropped outside gate positions, this is a delete operation
        if (!e.target.classList.contains('gate-position')) {
            if (this.draggedElement && this.draggedElement.type === 'move-gate') {
                this.removeGate(this.draggedElement.gate);
                this.showToastAsPopup('Gate removed', 'info');
            }
        }
    }

    handlePositionDrop(e, position) {
        if (!this.draggedElement) return;

        const qubit = parseInt(position.getAttribute('data-qubit'));
        const column = parseInt(position.getAttribute('data-column'));

        if (this.draggedElement.type === 'new-gate') {
            this.addGateToCircuit(this.draggedElement.gate.type, qubit, column);
        } else if (this.draggedElement.type === 'move-gate') {
            this.moveGate(this.draggedElement.gate, qubit, column);
        }
    }

    // ==========================================
    // CIRCUIT OPERATIONS
    // ==========================================
    
    addGateToCircuit(gateType, qubit, column, params = {}) {
        // Save current state for undo
        this.saveState();

        // Check if position is already occupied
        const existingGateIndex = this.circuit.findIndex(g => g.qubit === qubit && g.column === column);
        if (existingGateIndex !== -1) {
            this.circuit[existingGateIndex] = { gate: gateType, qubit, column, params };
        } else {
            this.circuit.push({ gate: gateType, qubit, column, params });
        }

        // Handle parametric gates
        if (gateType.startsWith('r')) {
            this.currentGateBeingParameterized = { gate: gateType, qubit, column };
            this.showModal('gateParameterModal');
            document.getElementById('parameterModalTitle').textContent = `Edit ${this.getGateName(gateType)} Parameters`;
        }

        this.renderCircuitCanvas();
        this.updateCircuitInfo();
        this.generateCode();
        
        // Update stats
        this.updateUserStats({ gatesUsed: 1 });
    }

    removeGate(gateInfo) {
        this.saveState();
        
        const index = this.circuit.findIndex(g => 
            g.qubit === gateInfo.qubit && 
            g.column === gateInfo.column && 
            g.gate === gateInfo.gate
        );
        
        if (index !== -1) {
            this.circuit.splice(index, 1);
            this.renderCircuitCanvas();
            this.updateCircuitInfo();
            this.generateCode();
        }
    }

    moveGate(gateInfo, newQubit, newColumn) {
        this.saveState();
        
        const gate = this.circuit.find(g => 
            g.qubit === gateInfo.qubit && 
            g.column === gateInfo.column && 
            g.gate === gateInfo.gate
        );

        if (gate) {
            gate.qubit = newQubit;
            gate.column = newColumn;
            this.renderCircuitCanvas();
            this.updateCircuitInfo();
            this.generateCode();
        }
    }

    clearCircuit() {
        if (this.circuit.length > 0) {
            this.saveState();
            this.circuit = [];
            this.renderCircuitCanvas();
            this.updateCircuitInfo();
            this.generateCode();
            this.showToastAsPopup('Circuit cleared', 'info');
        }
    }

    addQubit() {
        if (this.qubits < 6) {
            this.saveState();
            this.qubits++;
            this.renderCircuitCanvas();
            this.updateCircuitInfo();
            document.getElementById('qubitCount').textContent = this.qubits;
            this.showToastAsPopup('Qubit added', 'success');
        } else {
            this.showToastAsPopup('Maximum 6 qubits supported', 'warning');
        }
    }

    removeQubit() {
        if (this.qubits > 1) {
            this.saveState();
            
            // Remove gates on the highest qubit
            this.circuit = this.circuit.filter(gate => gate.qubit !== this.qubits - 1);
            
            this.qubits--;
            this.renderCircuitCanvas();
            this.updateCircuitInfo();
            document.getElementById('qubitCount').textContent = this.qubits;
            this.showToastAsPopup('Qubit removed', 'info');
        } else {
            this.showToastAsPopup('Minimum 1 qubit required', 'warning');
        }
    }

    // ==========================================
    // HISTORY MANAGEMENT (UNDO/REDO)
    // ==========================================
    
    saveState() {
        const state = {
            circuit: JSON.parse(JSON.stringify(this.circuit)),
            qubits: this.qubits
        };
        
        this.history.push(state);
        this.redoStack = []; // Clear redo stack when new action is performed
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
        }
        
        this.updateHistoryButtons();
    }

    undo() {
        if (this.history.length > 0) {
            // Save current state to redo stack
            const currentState = {
                circuit: JSON.parse(JSON.stringify(this.circuit)),
                qubits: this.qubits
            };
            this.redoStack.push(currentState);
            
            // Restore previous state
            const previousState = this.history.pop();
            this.circuit = previousState.circuit;
            this.qubits = previousState.qubits;
            
            this.renderCircuitCanvas();
            this.updateCircuitInfo();
            this.generateCode();
            document.getElementById('qubitCount').textContent = this.qubits;
            this.updateHistoryButtons();
            this.showToastAsPopup('Action undone', 'info');
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            // Save current state to history
            this.saveState();
            
            // Restore next state
            const nextState = this.redoStack.pop();
            this.circuit = nextState.circuit;
            this.qubits = nextState.qubits;
            
            this.renderCircuitCanvas();
            this.updateCircuitInfo();
            this.generateCode();
            document.getElementById('qubitCount').textContent = this.qubits;
            this.updateHistoryButtons();
            this.showToastAsPopup('Action redone', 'info');
        }
    }

    updateHistoryButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) undoBtn.disabled = this.history.length === 0;
        if (redoBtn) redoBtn.disabled = this.redoStack.length === 0;
    }

    // ==========================================
    // GATE PARAMETERS
    // ==========================================
    
    editGateParameters(gateInfo) {
        this.currentGateBeingParameterized = gateInfo;
        this.showModal('gateParameterModal');
        document.getElementById('parameterModalTitle').textContent = `Edit ${this.getGateName(gateInfo.gate)} Parameters`;
        document.getElementById('gateAngle').value = gateInfo.params?.angle || Math.PI / 2;
    }

    saveGateParameters() {
        if (!this.currentGateBeingParameterized) return;

        const angle = parseFloat(document.getElementById('gateAngle').value);
        
        const gate = this.circuit.find(g => 
            g.qubit === this.currentGateBeingParameterized.qubit && 
            g.column === this.currentGateBeingParameterized.column && 
            g.gate === this.currentGateBeingParameterized.gate
        );

        if (gate) {
            gate.params = { angle };
            this.generateCode();
            this.showToastAsPopup('Parameters saved', 'success');
        }

        this.hideModal('gateParameterModal');
        this.currentGateBeingParameterized = null;
    }

    // ==========================================
    // SIMULATION
    // ==========================================
    
    async simulateCircuit() {
        if (this.circuit.length === 0) {
            this.showToastAsPopup('Add gates to circuit before simulation', 'warning');
            return;
        }

        this.showLoading('Simulating quantum circuit...');
        
        try {
            // Simulate delay for realistic feel
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const results = this.performQuantumSimulation();
            
            this.displayProbabilityChart(results.probabilities);
            this.updateBlochSphere(results.blochVectors);
            this.generateCode();
            
            this.switchTab('probability');
            this.showToastAsPopup('Simulation completed', 'success');
            
            // Update stats
            this.updateUserStats({ simulationsRun: 1 });
            
        } catch (error) {
            this.showToastAsPopup('Simulation failed: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    performQuantumSimulation() {
        // Simple quantum simulation (for demonstration)
        const numStates = Math.pow(2, this.qubits);
        const probabilities = {};
        
        // Initialize probabilities
        for (let i = 0; i < numStates; i++) {
            const state = i.toString(2).padStart(this.qubits, '0');
            probabilities[state] = Math.random();
        }
        
        // Normalize probabilities
        const sum = Object.values(probabilities).reduce((a, b) => a + b, 0);
        Object.keys(probabilities).forEach(state => {
            probabilities[state] /= sum;
        });
        
        // Generate Bloch vectors for each qubit
        const blochVectors = [];
        for (let q = 0; q < this.qubits; q++) {
            blochVectors.push({
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1,
                z: Math.random() * 2 - 1
            });
        }
        
        return { probabilities, blochVectors };
    }

    displayProbabilityChart(probabilities) {
        const ctx = document.getElementById('probabilityChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.probabilityChart) {
            this.probabilityChart.destroy();
        }

        const labels = Object.keys(probabilities);
        const data = Object.values(probabilities);

        this.probabilityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(label => '|' + label + '⟩'),
                datasets: [{
                    label: 'Probability',
                    data: data,
                    backgroundColor: 'rgba(14, 165, 233, 0.6)',
                    borderColor: 'rgba(14, 165, 233, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            format: {
                                style: 'percent'
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Measurement Probabilities'
                    }
                }
            }
        });
    }

    // ==========================================
    // BLOCH SPHERE VISUALIZATION
    // ==========================================
    
    initializeBlochSphere() {
        const container = document.getElementById('blochSphere');
        if (!container || !window.THREE) return;

        // Clear existing renderer
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // Setup Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Create Bloch sphere
        const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x7c3aed,
            wireframe: true,
            opacity: 0.3,
            transparent: true
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);

        // Add axes
        const axesHelper = new THREE.AxesHelper(1.2);
        scene.add(axesHelper);

        // Add state vector
        const arrowGeometry = new THREE.ConeGeometry(0.05, 0.1, 8);
        const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 1)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff4444 });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        
        scene.add(arrow);
        scene.add(line);

        // Position camera
        camera.position.set(2, 2, 2);
        camera.lookAt(0, 0, 0);

        // Add orbit controls if available
        if (window.THREE.OrbitControls) {
            const controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableZoom = true;
            controls.enablePan = false;
        }

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            sphere.rotation.y += 0.005;
            renderer.render(scene, camera);
        };
        animate();

        this.blochRenderer = { scene, camera, renderer, arrow, line };
    }

    updateBlochSphere(blochVectors) {
        if (!this.blochRenderer || !blochVectors.length) return;

        // Update the first qubit's Bloch vector
        const vector = blochVectors[0];
        const { arrow, line } = this.blochRenderer;
        
        // Update line
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(vector.x, vector.y, vector.z)
        ]);
        line.geometry.dispose();
        line.geometry = lineGeometry;
        
        // Update arrow position
        arrow.position.set(vector.x, vector.y, vector.z);
        arrow.lookAt(vector.x * 2, vector.y * 2, vector.z * 2);

        // Update qubit states display
        const statesContainer = document.getElementById('qubitStates');
        if (statesContainer) {
            statesContainer.innerHTML = '';
            blochVectors.forEach((vector, index) => {
                const stateDiv = document.createElement('div');
                stateDiv.innerHTML = `
                    <strong>Qubit ${index}:</strong><br>
                    X: ${vector.x.toFixed(3)}<br>
                    Y: ${vector.y.toFixed(3)}<br>
                    Z: ${vector.z.toFixed(3)}
                `;
                statesContainer.appendChild(stateDiv);
            });
        }
    }"""

# Save second part of app.js
with open(f"{project_name}/app_part2.js", "w") as f:
    f.write(app_js_part2)

print(f"✅ Created {project_name}/app_part2.js")