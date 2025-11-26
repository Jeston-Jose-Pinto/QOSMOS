# 5. Final part of app.js with multi-language code generation and import
app_js_part3 = """
    // ==========================================
    // CODE GENERATION (MULTI-LANGUAGE)
    // ==========================================
    
    generateCode() {
        if (this.circuit.length === 0) {
            this.displayCode('// Add gates to your circuit to see generated code');
            return;
        }

        let code = '';
        switch (this.currentLanguage) {
            case 'qiskit':
                code = this.generateQiskitCode();
                break;
            case 'qasm':
                code = this.generateQASMCode();
                break;
            case 'cirq':
                code = this.generateCirqCode();
                break;
            case 'qsharp':
                code = this.generateQSharpCode();
                break;
            case 'braket':
                code = this.generateBraketCode();
                break;
            case 'quil':
                code = this.generateQuilCode();
                break;
            case 'pennylane':
                code = this.generatePennyLaneCode();
                break;
            case 'xacc':
                code = this.generateXACCCode();
                break;
            default:
                code = this.generateQiskitCode();
        }

        this.displayCode(code);
    }

    generateQiskitCode() {
        let code = `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit import transpile, Aer, execute
from qiskit.visualization import plot_histogram
import numpy as np

# Create quantum circuit with ${this.qubits} qubits
qr = QuantumRegister(${this.qubits}, 'q')
cr = ClassicalRegister(${this.qubits}, 'c')
qc = QuantumCircuit(qr, cr)

`;

        // Sort gates by column for proper execution order
        const sortedGates = [...this.circuit].sort((a, b) => a.column - b.column || a.qubit - b.qubit);

        code += `# Add quantum gates\n`;
        sortedGates.forEach(gate => {
            switch (gate.gate) {
                case 'h':
                    code += `qc.h(qr[${gate.qubit}])  # Hadamard gate\n`;
                    break;
                case 'x':
                    code += `qc.x(qr[${gate.qubit}])  # Pauli-X gate\n`;
                    break;
                case 'y':
                    code += `qc.y(qr[${gate.qubit}])  # Pauli-Y gate\n`;
                    break;
                case 'z':
                    code += `qc.z(qr[${gate.qubit}])  # Pauli-Z gate\n`;
                    break;
                case 's':
                    code += `qc.s(qr[${gate.qubit}])  # Phase gate\n`;
                    break;
                case 't':
                    code += `qc.t(qr[${gate.qubit}])  # T gate\n`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || Math.PI / 2;
                    code += `qc.rx(${rxAngle}, qr[${gate.qubit}])  # X-rotation gate\n`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || Math.PI / 2;
                    code += `qc.ry(${ryAngle}, qr[${gate.qubit}])  # Y-rotation gate\n`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || Math.PI / 2;
                    code += `qc.rz(${rzAngle}, qr[${gate.qubit}])  # Z-rotation gate\n`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        code += `qc.cx(qr[${gate.qubit}], qr[${gate.qubit + 1}])  # CNOT gate\n`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        code += `qc.cz(qr[${gate.qubit}], qr[${gate.qubit + 1}])  # Controlled-Z gate\n`;
                    }
                    break;
                case 'measure':
                    code += `qc.measure(qr[${gate.qubit}], cr[${gate.qubit}])  # Measurement\n`;
                    break;
            }
        });

        code += `\n# Simulate the circuit
simulator = Aer.get_backend('qasm_simulator')
job = execute(qc, simulator, shots=1024)
result = job.result()
counts = result.get_counts(qc)

print("Measurement results:")
print(counts)

# Plot results
plot_histogram(counts)
plt.show()
`;

        return code;
    }

    generateQASMCode() {
        let qasm = `OPENQASM 2.0;
include "qelib1.inc";

// Quantum circuit with ${this.qubits} qubits and ${this.circuit.length} gates
qreg q[${this.qubits}];
creg c[${this.qubits}];

`;

        const sortedGates = [...this.circuit].sort((a, b) => a.column - b.column || a.qubit - b.qubit);

        sortedGates.forEach(gate => {
            switch (gate.gate) {
                case 'h':
                case 'x':
                case 'y':
                case 'z':
                case 's':
                case 't':
                    qasm += `${gate.gate} q[${gate.qubit}];  // ${gate.gate.toUpperCase()} gate on qubit ${gate.qubit}\n`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || 'pi/2';
                    qasm += `rx(${rxAngle}) q[${gate.qubit}];  // X-rotation by ${rxAngle}\n`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || 'pi/2';
                    qasm += `ry(${ryAngle}) q[${gate.qubit}];  // Y-rotation by ${ryAngle}\n`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || 'pi/2';
                    qasm += `rz(${rzAngle}) q[${gate.qubit}];  // Z-rotation by ${rzAngle}\n`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        qasm += `cx q[${gate.qubit}],q[${gate.qubit + 1}];  // CNOT from q${gate.qubit} to q${gate.qubit + 1}\n`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        qasm += `cz q[${gate.qubit}],q[${gate.qubit + 1}];  // Controlled-Z from q${gate.qubit} to q${gate.qubit + 1}\n`;
                    }
                    break;
                case 'measure':
                    qasm += `measure q[${gate.qubit}] -> c[${gate.qubit}];  // Measure qubit ${gate.qubit}\n`;
                    break;
            }
        });

        return qasm;
    }

    generateCirqCode() {
        let code = `import cirq
import numpy as np

# Create qubits
qubits = [cirq.GridQubit(i, 0) for i in range(${this.qubits})]

# Create circuit
circuit = cirq.Circuit()

`;

        const sortedGates = [...this.circuit].sort((a, b) => a.column - b.column || a.qubit - b.qubit);

        code += `# Add gates to circuit\n`;
        sortedGates.forEach(gate => {
            switch (gate.gate) {
                case 'h':
                    code += `circuit.append(cirq.H(qubits[${gate.qubit}]))  # Hadamard\n`;
                    break;
                case 'x':
                    code += `circuit.append(cirq.X(qubits[${gate.qubit}]))  # Pauli-X\n`;
                    break;
                case 'y':
                    code += `circuit.append(cirq.Y(qubits[${gate.qubit}]))  # Pauli-Y\n`;
                    break;
                case 'z':
                    code += `circuit.append(cirq.Z(qubits[${gate.qubit}]))  # Pauli-Z\n`;
                    break;
                case 's':
                    code += `circuit.append(cirq.S(qubits[${gate.qubit}]))  # Phase gate\n`;
                    break;
                case 't':
                    code += `circuit.append(cirq.T(qubits[${gate.qubit}]))  # T gate\n`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || Math.PI / 2;
                    code += `circuit.append(cirq.rx(${rxAngle})(qubits[${gate.qubit}]))  # X-rotation\n`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || Math.PI / 2;
                    code += `circuit.append(cirq.ry(${ryAngle})(qubits[${gate.qubit}]))  # Y-rotation\n`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || Math.PI / 2;
                    code += `circuit.append(cirq.rz(${rzAngle})(qubits[${gate.qubit}]))  # Z-rotation\n`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        code += `circuit.append(cirq.CNOT(qubits[${gate.qubit}], qubits[${gate.qubit + 1}]))  # CNOT\n`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        code += `circuit.append(cirq.CZ(qubits[${gate.qubit}], qubits[${gate.qubit + 1}]))  # Controlled-Z\n`;
                    }
                    break;
                case 'measure':
                    code += `circuit.append(cirq.measure(qubits[${gate.qubit}], key='m${gate.qubit}'))  # Measurement\n`;
                    break;
            }
        });

        code += `
# Simulate the circuit
simulator = cirq.Simulator()
result = simulator.run(circuit, repetitions=1024)

print("Circuit:")
print(circuit)

print("\\nSimulation results:")
print(result.histogram(key='m0'))  # Adjust key based on measurements
`;

        return code;
    }

    generateQSharpCode() {
        let code = `namespace QuantumCircuit {
    open Microsoft.Quantum.Canon;
    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Measurement;
    open Microsoft.Quantum.Math;

    /// # Summary
    /// Quantum circuit with ${this.qubits} qubits and ${this.circuit.length} gates
    operation RunQuantumCircuit() : Result[] {
        using (qubits = Qubit[${this.qubits}]) {
`;

        const sortedGates = [...this.circuit].sort((a, b) => a.column - b.column || a.qubit - b.qubit);

        sortedGates.forEach(gate => {
            switch (gate.gate) {
                case 'h':
                    code += `            H(qubits[${gate.qubit}]);  // Hadamard gate\n`;
                    break;
                case 'x':
                    code += `            X(qubits[${gate.qubit}]);  // Pauli-X gate\n`;
                    break;
                case 'y':
                    code += `            Y(qubits[${gate.qubit}]);  // Pauli-Y gate\n`;
                    break;
                case 'z':
                    code += `            Z(qubits[${gate.qubit}]);  // Pauli-Z gate\n`;
                    break;
                case 's':
                    code += `            S(qubits[${gate.qubit}]);  // Phase gate\n`;
                    break;
                case 't':
                    code += `            T(qubits[${gate.qubit}]);  // T gate\n`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || 'PI() / 2.0';
                    code += `            Rx(${rxAngle}, qubits[${gate.qubit}]);  // X-rotation\n`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || 'PI() / 2.0';
                    code += `            Ry(${ryAngle}, qubits[${gate.qubit}]);  // Y-rotation\n`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || 'PI() / 2.0';
                    code += `            Rz(${rzAngle}, qubits[${gate.qubit}]);  // Z-rotation\n`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        code += `            CNOT(qubits[${gate.qubit}], qubits[${gate.qubit + 1}]);  // CNOT gate\n`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        code += `            Controlled Z([qubits[${gate.qubit}]], qubits[${gate.qubit + 1}]);  // Controlled-Z gate\n`;
                    }
                    break;
            }
        });

        code += `
            // Measure all qubits
            let results = new Result[${this.qubits}];
            for (i in 0..${this.qubits - 1}) {
                set results w/= i <- M(qubits[i]);
            }
            
            ResetAll(qubits);
            return results;
        }
    }
    
    @EntryPoint()
    operation Main() : Unit {
        let results = RunQuantumCircuit();
        Message($"Measurement results: {results}");
    }
}
`;

        return code;
    }

    generateBraketCode() {
        let code = `from braket.circuits import Circuit
from braket.devices import LocalSimulator
import numpy as np

# Create quantum circuit with ${this.qubits} qubits
circuit = Circuit()

`;

        const sortedGates = [...this.circuit].sort((a, b) => a.column - b.column || a.qubit - b.qubit);

        code += `# Add quantum gates\n`;
        sortedGates.forEach(gate => {
            switch (gate.gate) {
                case 'h':
                    code += `circuit.h(${gate.qubit})  # Hadamard gate\n`;
                    break;
                case 'x':
                    code += `circuit.x(${gate.qubit})  # Pauli-X gate\n`;
                    break;
                case 'y':
                    code += `circuit.y(${gate.qubit})  # Pauli-Y gate\n`;
                    break;
                case 'z':
                    code += `circuit.z(${gate.qubit})  # Pauli-Z gate\n`;
                    break;
                case 's':
                    code += `circuit.s(${gate.qubit})  # Phase gate\n`;
                    break;
                case 't':
                    code += `circuit.t(${gate.qubit})  # T gate\n`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || Math.PI / 2;
                    code += `circuit.rx(${gate.qubit}, ${rxAngle})  # X-rotation gate\n`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || Math.PI / 2;
                    code += `circuit.ry(${gate.qubit}, ${ryAngle})  # Y-rotation gate\n`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || Math.PI / 2;
                    code += `circuit.rz(${gate.qubit}, ${rzAngle})  # Z-rotation gate\n`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        code += `circuit.cnot(${gate.qubit}, ${gate.qubit + 1})  # CNOT gate\n`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        code += `circuit.cz(${gate.qubit}, ${gate.qubit + 1})  # Controlled-Z gate\n`;
                    }
                    break;
            }
        });

        code += `
# Simulate the circuit
device = LocalSimulator()
task = device.run(circuit, shots=1024)
result = task.result()

print("Circuit:")
print(circuit)

print("\\nMeasurement results:")
print(result.measurement_counts)
`;

        return code;
    }

    generateQuilCode() {
        let quil = `# Quil program with ${this.qubits} qubits and ${this.circuit.length} gates

`;

        const sortedGates = [...this.circuit].sort((a, b) => a.column - b.column || a.qubit - b.qubit);

        sortedGates.forEach(gate => {
            switch (gate.gate) {
                case 'h':
                    quil += `H ${gate.qubit}\\n`;
                    break;
                case 'x':
                    quil += `X ${gate.qubit}\\n`;
                    break;
                case 'y':
                    quil += `Y ${gate.qubit}\\n`;
                    break;
                case 'z':
                    quil += `Z ${gate.qubit}\\n`;
                    break;
                case 's':
                    quil += `S ${gate.qubit}\\n`;
                    break;
                case 't':
                    quil += `T ${gate.qubit}\\n`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || Math.PI / 2;
                    quil += `RX(${rxAngle}) ${gate.qubit}\\n`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || Math.PI / 2;
                    quil += `RY(${ryAngle}) ${gate.qubit}\\n`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || Math.PI / 2;
                    quil += `RZ(${rzAngle}) ${gate.qubit}\\n`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        quil += `CNOT ${gate.qubit} ${gate.qubit + 1}\\n`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        quil += `CZ ${gate.qubit} ${gate.qubit + 1}\\n`;
                    }
                    break;
                case 'measure':
                    quil += `MEASURE ${gate.qubit} ro[${gate.qubit}]\\n`;
                    break;
            }
        });

        return quil;
    }

    generatePennyLaneCode() {
        let code = `import pennylane as qml
import numpy as np

# Create device
dev = qml.device('default.qubit', wires=${this.qubits})

@qml.qnode(dev)
def circuit():
`;

        const sortedGates = [...this.circuit].sort((a, b) => a.column - b.column || a.qubit - b.qubit);

        code += `    # Add quantum gates\n`;
        sortedGates.forEach(gate => {
            switch (gate.gate) {
                case 'h':
                    code += `    qml.Hadamard(wires=${gate.qubit})  # Hadamard gate\n`;
                    break;
                case 'x':
                    code += `    qml.PauliX(wires=${gate.qubit})  # Pauli-X gate\n`;
                    break;
                case 'y':
                    code += `    qml.PauliY(wires=${gate.qubit})  # Pauli-Y gate\n`;
                    break;
                case 'z':
                    code += `    qml.PauliZ(wires=${gate.qubit})  # Pauli-Z gate\n`;
                    break;
                case 's':
                    code += `    qml.S(wires=${gate.qubit})  # Phase gate\n`;
                    break;
                case 't':
                    code += `    qml.T(wires=${gate.qubit})  # T gate\n`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || Math.PI / 2;
                    code += `    qml.RX(${rxAngle}, wires=${gate.qubit})  # X-rotation gate\n`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || Math.PI / 2;
                    code += `    qml.RY(${ryAngle}, wires=${gate.qubit})  # Y-rotation gate\n`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || Math.PI / 2;
                    code += `    qml.RZ(${rzAngle}, wires=${gate.qubit})  # Z-rotation gate\n`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        code += `    qml.CNOT(wires=[${gate.qubit}, ${gate.qubit + 1}])  # CNOT gate\n`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        code += `    qml.CZ(wires=[${gate.qubit}, ${gate.qubit + 1}])  # Controlled-Z gate\n`;
                    }
                    break;
            }
        });

        code += `    
    return [qml.expval(qml.PauliZ(i)) for i in range(${this.qubits})]

# Execute circuit
result = circuit()
print("Expectation values:", result)
`;

        return code;
    }

    generateXACCCode() {
        let code = `#include "xacc.hpp"
#include <iostream>

int main() {
    // Initialize XACC
    xacc::Initialize();
    
    // Create quantum circuit with ${this.qubits} qubits
    auto circuit = xacc::createComposite("quantum_circuit");
    
`;

        const sortedGates = [...this.circuit].sort((a, b) => a.column - b.column || a.qubit - b.qubit);

        code += `    // Add quantum gates\n`;
        sortedGates.forEach(gate => {
            switch (gate.gate) {
                case 'h':
                    code += `    circuit->addInstruction(xacc::createInstruction("H", {${gate.qubit}}));  // Hadamard gate\n`;
                    break;
                case 'x':
                    code += `    circuit->addInstruction(xacc::createInstruction("X", {${gate.qubit}}));  // Pauli-X gate\n`;
                    break;
                case 'y':
                    code += `    circuit->addInstruction(xacc::createInstruction("Y", {${gate.qubit}}));  // Pauli-Y gate\n`;
                    break;
                case 'z':
                    code += `    circuit->addInstruction(xacc::createInstruction("Z", {${gate.qubit}}));  // Pauli-Z gate\n`;
                    break;
                case 's':
                    code += `    circuit->addInstruction(xacc::createInstruction("S", {${gate.qubit}}));  // Phase gate\n`;
                    break;
                case 't':
                    code += `    circuit->addInstruction(xacc::createInstruction("T", {${gate.qubit}}));  // T gate\n`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || Math.PI / 2;
                    code += `    circuit->addInstruction(xacc::createInstruction("Rx", {${gate.qubit}}, {${rxAngle}}));  // X-rotation gate\n`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || Math.PI / 2;
                    code += `    circuit->addInstruction(xacc::createInstruction("Ry", {${gate.qubit}}, {${ryAngle}}));  // Y-rotation gate\n`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || Math.PI / 2;
                    code += `    circuit->addInstruction(xacc::createInstruction("Rz", {${gate.qubit}}, {${rzAngle}}));  // Z-rotation gate\n`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        code += `    circuit->addInstruction(xacc::createInstruction("CNOT", {${gate.qubit}, ${gate.qubit + 1}}));  // CNOT gate\n`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        code += `    circuit->addInstruction(xacc::createInstruction("CZ", {${gate.qubit}, ${gate.qubit + 1}}));  // Controlled-Z gate\n`;
                    }
                    break;
                case 'measure':
                    code += `    circuit->addInstruction(xacc::createInstruction("Measure", {${gate.qubit}}));  // Measurement\n`;
                    break;
            }
        });

        code += `
    // Execute circuit
    auto accelerator = xacc::getAccelerator("qpp");
    auto buffer = xacc::qalloc(${this.qubits});
    accelerator->execute(buffer, circuit);
    
    std::cout << "Circuit executed successfully" << std::endl;
    buffer->print();
    
    xacc::Finalize();
    return 0;
}
`;

        return code;
    }

    displayCode(code) {
        const codeEditor = document.getElementById('codeEditor');
        if (!codeEditor) return;

        codeEditor.innerHTML = `<pre><code class="language-${this.getCodeLanguage()}">${this.escapeHtml(code)}</code></pre>`;
        
        // Apply syntax highlighting if Prism is available
        if (window.Prism) {
            window.Prism.highlightAll();
        }
    }

    getCodeLanguage() {
        const languageMap = {
            'qiskit': 'python',
            'cirq': 'python',
            'braket': 'python',
            'pennylane': 'python',
            'qasm': 'plaintext',
            'quil': 'plaintext',
            'qsharp': 'csharp',
            'xacc': 'cpp'
        };
        return languageMap[this.currentLanguage] || 'plaintext';
    }

    exportCode() {
        if (this.circuit.length === 0) {
            this.showToastAsPopup('Add gates to circuit before exporting', 'warning');
            return;
        }

        this.generateCode();
        const code = document.getElementById('codeEditor').textContent;
        const language = this.currentLanguage;
        const extension = this.getFileExtension(language);
        const filename = `quantum_circuit.${extension}`;

        // Create and download file
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        this.showToastAsPopup(`Code exported as ${filename}`, 'success');
        this.updateUserStats({ codeExports: 1 });
    }

    getFileExtension(language) {
        const extensionMap = {
            'qiskit': 'py',
            'cirq': 'py',
            'braket': 'py',
            'pennylane': 'py',
            'qasm': 'qasm',
            'quil': 'quil',
            'qsharp': 'qs',
            'xacc': 'cpp'
        };
        return extensionMap[language] || 'txt';
    }

    // ==========================================
    // CODE IMPORT SYSTEM
    // ==========================================
    
    importCode() {
        const codeArea = document.getElementById('importCodeArea');
        const languageSelect = document.getElementById('importLanguageSelect');
        const statusDiv = document.getElementById('importStatus');
        
        if (!codeArea || !languageSelect) return;

        const code = codeArea.value.trim();
        const language = languageSelect.value;

        if (!code) {
            this.showImportStatus('Please paste quantum code to import', 'error');
            return;
        }

        try {
            this.showImportStatus('Parsing code...', 'info');
            
            const parsedCircuit = this.parseQuantumCode(code, language);
            
            if (parsedCircuit.length > 0) {
                this.saveState();
                this.circuit = parsedCircuit;
                this.renderCircuitCanvas();
                this.updateCircuitInfo();
                this.generateCode();
                this.showImportStatus(`Successfully imported ${parsedCircuit.length} gates`, 'success');
                this.showToastAsPopup('Circuit imported successfully!', 'success');
                this.switchTab('code');
            } else {
                this.showImportStatus('No gates found in the code', 'error');
            }
        } catch (error) {
            this.showImportStatus(`Import failed: ${error.message}`, 'error');
        }
    }

    parseQuantumCode(code, language) {
        const circuit = [];
        let currentColumn = 0;
        
        switch (language) {
            case 'qiskit':
                return this.parseQiskitCode(code);
            case 'qasm':
                return this.parseQASMCode(code);
            case 'cirq':
                return this.parseCirqCode(code);
            case 'qsharp':
                return this.parseQSharpCode(code);
            case 'quil':
                return this.parseQuilCode(code);
            default:
                throw new Error(`Language ${language} not supported for import`);
        }
    }

    parseQiskitCode(code) {
        const circuit = [];
        const lines = code.split('\\n');
        let column = 0;

        lines.forEach(line => {
            line = line.trim();
            
            // Parse Qiskit gate calls
            if (line.startsWith('qc.')) {
                const gateMatch = line.match(/qc\\.([a-zA-Z]+)\\(.*?\\[(\\d+)\\]/);
                if (gateMatch) {
                    const gateType = gateMatch[1];
                    const qubit = parseInt(gateMatch[2]);
                    
                    // Handle parametric gates
                    let params = {};
                    const paramMatch = line.match(/qc\\.[a-zA-Z]+\\(([^,]+),/);
                    if (paramMatch && !isNaN(parseFloat(paramMatch[1]))) {
                        params.angle = parseFloat(paramMatch[1]);
                    }
                    
                    circuit.push({
                        gate: gateType,
                        qubit: qubit,
                        column: column,
                        params: params
                    });
                    
                    column++;
                }
            }
        });

        return circuit;
    }

    parseQASMCode(code) {
        const circuit = [];
        const lines = code.split('\\n');
        let column = 0;

        lines.forEach(line => {
            line = line.trim();
            
            // Skip comments and declarations
            if (line.startsWith('//') || line.startsWith('OPENQASM') || 
                line.startsWith('include') || line.startsWith('qreg') || 
                line.startsWith('creg') || !line) {
                return;
            }
            
            // Parse single qubit gates
            const singleGateMatch = line.match(/^([hxyzstz])\\s+q\\[(\\d+)\\]/);
            if (singleGateMatch) {
                circuit.push({
                    gate: singleGateMatch[1],
                    qubit: parseInt(singleGateMatch[2]),
                    column: column,
                    params: {}
                });
                column++;
                return;
            }
            
            // Parse rotation gates
            const rotationMatch = line.match(/^([rR][xyz])\\(([^)]+)\\)\\s+q\\[(\\d+)\\]/);
            if (rotationMatch) {
                circuit.push({
                    gate: rotationMatch[1].toLowerCase(),
                    qubit: parseInt(rotationMatch[3]),
                    column: column,
                    params: { angle: parseFloat(rotationMatch[2]) }
                });
                column++;
                return;
            }
            
            // Parse two-qubit gates
            const twoQubitMatch = line.match(/^(cx|cz)\\s+q\\[(\\d+)\\],\\s*q\\[(\\d+)\\]/);
            if (twoQubitMatch) {
                circuit.push({
                    gate: twoQubitMatch[1],
                    qubit: parseInt(twoQubitMatch[2]),
                    column: column,
                    params: {}
                });
                column++;
                return;
            }
            
            // Parse measurements
            const measureMatch = line.match(/^measure\\s+q\\[(\\d+)\\]/);
            if (measureMatch) {
                circuit.push({
                    gate: 'measure',
                    qubit: parseInt(measureMatch[1]),
                    column: column,
                    params: {}
                });
                column++;
            }
        });

        return circuit;
    }

    parseCirqCode(code) {
        const circuit = [];
        const lines = code.split('\\n');
        let column = 0;

        lines.forEach(line => {
            line = line.trim();
            
            if (line.includes('circuit.append(cirq.')) {
                const gateMatch = line.match(/cirq\\.([A-Z]+)\\(qubits\\[(\\d+)\\]/);
                if (gateMatch) {
                    const cirqGate = gateMatch[1];
                    const qubit = parseInt(gateMatch[2]);
                    
                    // Map Cirq gates to our gate types
                    const gateMap = {
                        'H': 'h',
                        'X': 'x',
                        'Y': 'y',
                        'Z': 'z',
                        'S': 's',
                        'T': 't',
                        'CNOT': 'cx',
                        'CZ': 'cz'
                    };
                    
                    const gateType = gateMap[cirqGate];
                    if (gateType) {
                        circuit.push({
                            gate: gateType,
                            qubit: qubit,
                            column: column,
                            params: {}
                        });
                        column++;
                    }
                }
                
                // Handle rotation gates
                const rotationMatch = line.match(/cirq\\.(r[xyz])\\(([^)]+)\\)/);
                if (rotationMatch) {
                    const qubitMatch = line.match(/qubits\\[(\\d+)\\]/);
                    if (qubitMatch) {
                        circuit.push({
                            gate: rotationMatch[1],
                            qubit: parseInt(qubitMatch[1]),
                            column: column,
                            params: { angle: parseFloat(rotationMatch[2]) }
                        });
                        column++;
                    }
                }
            }
        });

        return circuit;
    }

    parseQSharpCode(code) {
        const circuit = [];
        const lines = code.split('\\n');
        let column = 0;

        lines.forEach(line => {
            line = line.trim();
            
            const gateMatch = line.match(/([HXYZSTZ])\\(qubits\\[(\\d+)\\]\\)/);
            if (gateMatch) {
                const qsharpGate = gateMatch[1];
                const qubit = parseInt(gateMatch[2]);
                
                const gateMap = {
                    'H': 'h',
                    'X': 'x',
                    'Y': 'y',
                    'Z': 'z',
                    'S': 's',
                    'T': 't'
                };
                
                const gateType = gateMap[qsharpGate];
                if (gateType) {
                    circuit.push({
                        gate: gateType,
                        qubit: qubit,
                        column: column,
                        params: {}
                    });
                    column++;
                }
            }
            
            // Handle CNOT
            const cnotMatch = line.match(/CNOT\\(qubits\\[(\\d+)\\],\\s*qubits\\[(\\d+)\\]\\)/);
            if (cnotMatch) {
                circuit.push({
                    gate: 'cx',
                    qubit: parseInt(cnotMatch[1]),
                    column: column,
                    params: {}
                });
                column++;
            }
        });

        return circuit;
    }

    parseQuilCode(code) {
        const circuit = [];
        const lines = code.split('\\n');
        let column = 0;

        lines.forEach(line => {
            line = line.trim();
            
            // Skip comments
            if (line.startsWith('#') || !line) return;
            
            // Parse single qubit gates
            const singleGateMatch = line.match(/^([HXYZSTZ])\\s+(\\d+)/);
            if (singleGateMatch) {
                const quilGate = singleGateMatch[1];
                const qubit = parseInt(singleGateMatch[2]);
                
                circuit.push({
                    gate: quilGate.toLowerCase(),
                    qubit: qubit,
                    column: column,
                    params: {}
                });
                column++;
                return;
            }
            
            // Parse rotation gates
            const rotationMatch = line.match(/^R([XYZ])\\(([^)]+)\\)\\s+(\\d+)/);
            if (rotationMatch) {
                const axis = rotationMatch[1].toLowerCase();
                const angle = parseFloat(rotationMatch[2]);
                const qubit = parseInt(rotationMatch[3]);
                
                circuit.push({
                    gate: 'r' + axis,
                    qubit: qubit,
                    column: column,
                    params: { angle: angle }
                });
                column++;
                return;
            }
            
            // Parse CNOT
            const cnotMatch = line.match(/^CNOT\\s+(\\d+)\\s+(\\d+)/);
            if (cnotMatch) {
                circuit.push({
                    gate: 'cx',
                    qubit: parseInt(cnotMatch[1]),
                    column: column,
                    params: {}
                });
                column++;
                return;
            }
        });

        return circuit;
    }

    showImportStatus(message, type) {
        const statusDiv = document.getElementById('importStatus');
        if (!statusDiv) return;

        statusDiv.textContent = message;
        statusDiv.className = `import-status ${type}`;
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    
    updateCircuitInfo() {
        const circuitInfo = document.getElementById('circuitInfo');
        if (circuitInfo) {
            circuitInfo.textContent = `${this.qubits} qubits, ${this.circuit.length} gates`;
        }
    }

    getGateSymbol(gateType) {
        const symbolMap = {
            'h': 'H', 'x': 'X', 'y': 'Y', 'z': 'Z', 's': 'S', 't': 'T',
            'rx': 'RX', 'ry': 'RY', 'rz': 'RZ',
            'cx': 'CX', 'cz': 'CZ', 'swap': '⊗',
            'measure': 'M'
        };
        return symbolMap[gateType] || gateType.toUpperCase();
    }

    getGateName(gateType) {
        const nameMap = {
            'h': 'Hadamard', 'x': 'Pauli-X', 'y': 'Pauli-Y', 'z': 'Pauli-Z',
            's': 'Phase', 't': 'T-gate',
            'rx': 'X-Rotation', 'ry': 'Y-Rotation', 'rz': 'Z-Rotation',
            'cx': 'CNOT', 'cz': 'Controlled-Z', 'swap': 'Swap',
            'measure': 'Measure'
        };
        return nameMap[gateType] || gateType.toUpperCase();
    }

    getGateColor(gateType) {
        const colorMap = {
            'h': '#e74c3c', 'x': '#e67e22', 'y': '#f39c12', 'z': '#27ae60',
            's': '#3498db', 't': '#9b59b6',
            'rx': '#e74c3c', 'ry': '#f39c12', 'rz': '#27ae60',
            'cx': '#34495e', 'cz': '#2c3e50', 'swap': '#8e44ad',
            'measure': '#95a5a6'
        };
        return colorMap[gateType] || '#34495e';
    }

    setDifficultyFilter(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        event.target.classList.add('active');
        
        this.isBeginnerMode = filter === 'beginner';
        this.renderGatePalette();
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            }
        });

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(`${tabName}Tab`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }

    async saveCircuit() {
        if (!this.currentUser || this.circuit.length === 0) {
            if (!this.currentUser) {
                this.showToastAsPopup('Please sign in to save circuits', 'warning');
            } else {
                this.showToastAsPopup('Add gates to circuit before saving', 'warning');
            }
            return;
        }

        try {
            this.showLoading('Saving circuit...');
            
            const circuitData = {
                name: `Circuit ${Date.now()}`,
                qubits: this.qubits,
                gates: this.circuit,
                language: this.currentLanguage,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                userId: this.currentUser.uid
            };

            await this.db.collection('circuits').add(circuitData);
            
            this.showToastAsPopup('Circuit saved successfully!', 'success');
            this.updateUserStats({ circuitsCreated: 1 });
            
        } catch (error) {
            this.showToastAsPopup('Failed to save circuit: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadRecentCircuits() {
        if (!this.currentUser || !this.db) return;

        try {
            const query = this.db.collection('circuits')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(5);
            
            const snapshot = await query.get();
            const circuits = [];
            
            snapshot.forEach(doc => {
                circuits.push({ id: doc.id, ...doc.data() });
            });
            
            this.displayRecentCircuits(circuits);
            
        } catch (error) {
            console.error('Error loading recent circuits:', error);
        }
    }

    displayRecentCircuits(circuits) {
        const container = document.getElementById('recentCircuitsList');
        if (!container) return;

        if (circuits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚛️</div>
                    <p>No circuits yet. Create your first quantum circuit!</p>
                    <button class="btn btn-primary" data-action="new-circuit">Get Started</button>
                </div>
            `;
            return;
        }

        container.innerHTML = circuits.map(circuit => `
            <div class="circuit-item">
                <div class="circuit-info">
                    <h4>${circuit.name}</h4>
                    <p>${circuit.qubits} qubits, ${circuit.gates.length} gates</p>
                    <small>Created: ${circuit.createdAt?.toDate().toLocaleDateString()}</small>
                </div>
                <div class="circuit-actions">
                    <button class="btn btn-ghost" onclick="quantumPlatform.loadCircuit('${circuit.id}')">Load</button>
                </div>
            </div>
        `).join('');
    }

    async loadCircuit(circuitId) {
        try {
            this.showLoading('Loading circuit...');
            
            const doc = await this.db.collection('circuits').doc(circuitId).get();
            if (doc.exists) {
                const data = doc.data();
                this.circuit = data.gates;
                this.qubits = data.qubits;
                this.currentLanguage = data.language || 'qiskit';
                
                document.getElementById('qubitCount').textContent = this.qubits;
                document.getElementById('exportLanguageSelect').value = this.currentLanguage;
                
                this.showPage('builder');
                this.renderCircuitCanvas();
                this.updateCircuitInfo();
                this.generateCode();
                
                this.showToastAsPopup('Circuit loaded successfully!', 'success');
            }
        } catch (error) {
            this.showToastAsPopup('Failed to load circuit: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    loadAlgorithmTemplate(templateName) {
        const templates = {
            'bell-state': {
                qubits: 2,
                gates: [
                    { gate: 'h', qubit: 0, column: 0, params: {} },
                    { gate: 'cx', qubit: 0, column: 1, params: {} }
                ]
            },
            'superposition': {
                qubits: 3,
                gates: [
                    { gate: 'h', qubit: 0, column: 0, params: {} },
                    { gate: 'h', qubit: 1, column: 0, params: {} },
                    { gate: 'h', qubit: 2, column: 0, params: {} }
                ]
            },
            'grover': {
                qubits: 2,
                gates: [
                    { gate: 'h', qubit: 0, column: 0, params: {} },
                    { gate: 'h', qubit: 1, column: 0, params: {} },
                    { gate: 'z', qubit: 1, column: 1, params: {} },
                    { gate: 'h', qubit: 0, column: 2, params: {} },
                    { gate: 'h', qubit: 1, column: 2, params: {} },
                    { gate: 'x', qubit: 0, column: 3, params: {} },
                    { gate: 'x', qubit: 1, column: 3, params: {} },
                    { gate: 'cz', qubit: 0, column: 4, params: {} },
                    { gate: 'x', qubit: 0, column: 5, params: {} },
                    { gate: 'x', qubit: 1, column: 5, params: {} },
                    { gate: 'h', qubit: 0, column: 6, params: {} },
                    { gate: 'h', qubit: 1, column: 6, params: {} }
                ]
            }
        };

        const template = templates[templateName];
        if (template) {
            this.saveState();
            this.circuit = template.gates;
            this.qubits = template.qubits;
            
            document.getElementById('qubitCount').textContent = this.qubits;
            this.renderCircuitCanvas();
            this.updateCircuitInfo();
            this.generateCode();
            
            this.showToastAsPopup(`${templateName.replace('-', ' ')} template loaded`, 'success');
        }
    }

    // ==========================================
    // UI HELPERS
    // ==========================================
    
    showModal(modalId) {
        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById(modalId);
        
        if (overlay && modal) {
            overlay.classList.remove('hidden');
            modal.classList.remove('hidden');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Check if any modals are still open
        const visibleModals = document.querySelectorAll('.modal:not(.hidden)');
        if (visibleModals.length === 0) {
            document.getElementById('modalOverlay')?.classList.add('hidden');
        }
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        document.getElementById('modalOverlay')?.classList.add('hidden');
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = document.getElementById('loadingText');
        
        if (overlay) overlay.classList.remove('hidden');
        if (text) text.textContent = message;
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.classList.add('hidden');
    }

    showToastAsPopup(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize the application
let quantumPlatform;
document.addEventListener('DOMContentLoaded', () => {
    quantumPlatform = new QuantumPlatform();
});

// Export for global access
window.quantumPlatform = quantumPlatform;"""

# Save final part of app.js
with open(f"{project_name}/app_part3.js", "w") as f:
    f.write(app_js_part3)

print(f"✅ Created {project_name}/app_part3.js")