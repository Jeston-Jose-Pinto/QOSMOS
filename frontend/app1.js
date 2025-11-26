// app.js – Enhanced Quantum Circuit Builder with Code Import & Visualization

//------------------------------------------------------------
// Complex number utilities
//------------------------------------------------------------
class Complex {
  constructor(re = 0, im = 0) {
    this.re = re;
    this.im = im;
  }

  static from(other) {
    return new Complex(other.re, other.im);
  }

  static add(a, b) {
    return new Complex(a.re + b.re, a.im + b.im);
  }

  static sub(a, b) {
    return new Complex(a.re - b.re, a.im - b.im);
  }

  static mul(a, b) {
    return new Complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  }

  static conj(a) {
    return new Complex(a.re, -a.im);
  }

  static magnitudeSquared(a) {
    return a.re * a.re + a.im * a.im;
  }

  toString() {
    const re = this.re.toFixed(3);
    const im = this.im.toFixed(3);
    return `${re} ${this.im >= 0 ? '+' : '-'} ${Math.abs(im)}i`;
  }
}

//------------------------------------------------------------
// Gate matrices (single qubit)
//------------------------------------------------------------
const SQRT1_2 = 1 / Math.sqrt(2);
const SINGLE_QUBIT_GATES = {
  h: [
    [new Complex(SQRT1_2, 0), new Complex(SQRT1_2, 0)],
    [new Complex(SQRT1_2, 0), new Complex(-SQRT1_2, 0)],
  ],
  x: [
    [new Complex(0, 0), new Complex(1, 0)],
    [new Complex(1, 0), new Complex(0, 0)],
  ],
  y: [
    [new Complex(0, 0), new Complex(0, -1)],
    [new Complex(0, 1), new Complex(0, 0)],
  ],
  z: [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(-1, 0)],
  ],
  s: [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, 1)],
  ],
  t: [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(Math.SQRT1_2, Math.SQRT1_2)],
  ],
};

//------------------------------------------------------------
// SimpleQuantumCircuit – enhanced with import functionality
//------------------------------------------------------------
class SimpleQuantumCircuit {
  constructor(qubits = 3, cols = 8) {
    this.numQubits = qubits;
    this.numCols = cols;
    this.gates = [];
    this.history = [[]];
    this.redoStack = []; // Track states for redo functionality
  }

  addGate(gate, qubit, col, params = {}) {

    console.log('gate getting added');
    
    if (qubit >= this.numQubits) throw new Error("Invalid qubit index");
    if ((gate === 'cx' || gate === 'cz') && qubit + 1 >= this.numQubits) {
      throw new Error("Not enough qubits for two-qubit gate");
    }
    this.gates.push({ gate, qubit, col, params });
    this.history.push(JSON.parse(JSON.stringify(this.gates)));
    this.redoStack = []; // Clear redo stack when new action is performed
  }

  clear() {
    this.gates = [];
    this.history = [[]];
    this.redoStack = []; // Clear redo stack when clearing circuit
  }

  undo() {
    if (this.history.length > 1) {
      // Save current state to redo stack
      this.redoStack.push(JSON.parse(JSON.stringify(this.gates)));
      this.history.pop();
      this.gates = JSON.parse(JSON.stringify(this.history[this.history.length - 1]));
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      // Save current state to history
      this.history.push(JSON.parse(JSON.stringify(this.gates)));
      // Restore from redo stack
      this.gates = this.redoStack.pop();
    }
  }

  exportCode(language) {
    switch (language) {
      case 'qasm': return this.exportQASM();
      case 'qiskit': return this.exportQiskit();
      case 'cirq': return this.exportCirq();
      case 'qsharp': return this.exportQSharp();
      case 'quil': return this.exportQuil();
      default: return this.exportQASM();
    }
  }

  exportQASM() {
    let qasm = `OPENQASM 2.0;\ninclude "qelib1.inc";\n`;
    qasm += `qreg q[${this.numQubits}];\n`;
    qasm += `creg c[${this.numQubits}];\n\n`;

    const sorted = [...this.gates].sort((a, b) => a.col - b.col);
    sorted.forEach((g) => {
      switch (g.gate) {
        case "h": case "x": case "y": case "z": case "s": case "t":
          qasm += `${g.gate} q[${g.qubit}];\n`;
          break;
        case "rx":
          const rxAngle = g.params?.angle || Math.PI / 2;
          qasm += `rx(${rxAngle}) q[${g.qubit}];\n`;
          break;
        case "ry":
          const ryAngle = g.params?.angle || Math.PI / 2;
          qasm += `ry(${ryAngle}) q[${g.qubit}];\n`;
          break;
        case "rz":
          const rzAngle = g.params?.angle || Math.PI / 2;
          qasm += `rz(${rzAngle}) q[${g.qubit}];\n`;
          break;
        case "cx":
          qasm += `cx q[${g.qubit}],q[${g.qubit + 1}];\n`;
          break;
        case "cz":
          qasm += `cz q[${g.qubit}],q[${g.qubit + 1}];\n`;
          break;
        case "measure":
          qasm += `measure q[${g.qubit}] -> c[${g.qubit}];\n`;
          break;
      }
    });
    return qasm;
  }

  exportQiskit() {
    let code = `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\n\n`;
    code += `# Create quantum circuit\n`;
    code += `qr = QuantumRegister(${this.numQubits}, 'q')\n`;
    code += `cr = ClassicalRegister(${this.numQubits}, 'c')\n`;
    code += `circuit = QuantumCircuit(qr, cr)\n\n`;

    const sorted = [...this.gates].sort((a, b) => a.col - b.col);
    sorted.forEach((g) => {
      switch (g.gate) {
        case "h": case "x": case "y": case "z": case "s": case "t":
          code += `circuit.${g.gate}(qr[${g.qubit}])\n`;
          break;
        case "rx":
          const rxAngle = g.params?.angle || Math.PI / 2;
          code += `circuit.rx(${rxAngle}, qr[${g.qubit}])\n`;
          break;
        case "ry":
          const ryAngle = g.params?.angle || Math.PI / 2;
          code += `circuit.ry(${ryAngle}, qr[${g.qubit}])\n`;
          break;
        case "rz":
          const rzAngle = g.params?.angle || Math.PI / 2;
          code += `circuit.rz(${rzAngle}, qr[${g.qubit}])\n`;
          break;
        case "cx":
          code += `circuit.cx(qr[${g.qubit}], qr[${g.qubit + 1}])\n`;
          break;
        case "cz":
          code += `circuit.cz(qr[${g.qubit}], qr[${g.qubit + 1}])\n`;
          break;
        case "measure":
          code += `circuit.measure(qr[${g.qubit}], cr[${g.qubit}])\n`;
          break;
      }
    });
    return code;
  }

  exportCirq() {
    let code = `import cirq\n\n`;
    code += `# Create qubits\n`;
    for (let i = 0; i < this.numQubits; i++) {
      code += `q${i} = cirq.GridQubit(${i}, 0)\n`;
    }
    code += `\n# Create circuit\ncircuit = cirq.Circuit()\n\n`;

    const sorted = [...this.gates].sort((a, b) => a.col - b.col);
    sorted.forEach((g) => {
      switch (g.gate) {
        case "h":
          code += `circuit.append(cirq.H(q${g.qubit}))\n`;
          break;
        case "x":
          code += `circuit.append(cirq.X(q${g.qubit}))\n`;
          break;
        case "y":
          code += `circuit.append(cirq.Y(q${g.qubit}))\n`;
          break;
        case "z":
          code += `circuit.append(cirq.Z(q${g.qubit}))\n`;
          break;
        case "s":
          code += `circuit.append(cirq.S(q${g.qubit}))\n`;
          break;
        case "t":
          code += `circuit.append(cirq.T(q${g.qubit}))\n`;
          break;
        case "rx":
          const rxAngle = g.params?.angle || Math.PI / 2;
          code += `circuit.append(cirq.rx(${rxAngle})(q${g.qubit}))  # X-rotation gate\n`;
          break;
        case "ry":
          const ryAngle = g.params?.angle || Math.PI / 2;
          code += `circuit.append(cirq.ry(${ryAngle})(q${g.qubit}))  # Y-rotation gate\n`;
          break;
        case "rz":
          const rzAngle = g.params?.angle || Math.PI / 2;
          code += `circuit.append(cirq.rz(${rzAngle})(q${g.qubit}))  # Z-rotation gate\n`;
          break;
        case "cx":
          code += `circuit.append(cirq.CNOT(q${g.qubit}, q${g.qubit + 1}))\n`;
          break;
        case "cz":
          code += `circuit.append(cirq.CZ(q${g.qubit}, q${g.qubit + 1}))\n`;
          break;
        case "measure":
          code += `circuit.append(cirq.measure(q${g.qubit}))\n`;
          break;
      }
    });
    return code;
  }

  exportQSharp() {
    let code = `namespace QuantumCircuit {\n    open Microsoft.Quantum.Canon;\n    open Microsoft.Quantum.Intrinsic;\n\n`;
    code += `    operation RunCircuit() : Unit {\n`;
    code += `        using (qubits = Qubit[${this.numQubits}]) {\n`;

    const sorted = [...this.gates].sort((a, b) => a.col - b.col);
    sorted.forEach((g) => {
      switch (g.gate) {
        case "h":
          code += `            H(qubits[${g.qubit}]);\n`;
          break;
        case "x":
          code += `            X(qubits[${g.qubit}]);\n`;
          break;
        case "y":
          code += `            Y(qubits[${g.qubit}]);\n`;
          break;
        case "z":
          code += `            Z(qubits[${g.qubit}]);\n`;
          break;
        case "s":
          code += `            S(qubits[${g.qubit}]);\n`;
          break;
        case "t":
          code += `            T(qubits[${g.qubit}]);
`;
          break;
        case "rx":
          const rxAngle = g.params?.angle || Math.PI / 2;
          code += `            Rx(${rxAngle}, qubits[${g.qubit}]);
`;
          break;
        case "ry":
          const ryAngle = g.params?.angle || Math.PI / 2;
          code += `            Ry(${ryAngle}, qubits[${g.qubit}]);
`;
          break;
        case "rz":
          const rzAngle = g.params?.angle || Math.PI / 2;
          code += `            Rz(${rzAngle}, qubits[${g.qubit}]);
`;
          break;
        case "cx":
          code += `            CNOT(qubits[${g.qubit}], qubits[${g.qubit + 1}]);
`;
          break;
        case "cz":
          code += `            CZ(qubits[${g.qubit}], qubits[${g.qubit + 1}]);
`;
          break;
        case "measure":
          code += `            M(qubits[${g.qubit}]);
`;
          break;
      }
    });

    code += `            ResetAll(qubits);\n        }\n    }\n}`;
    return code;
  }

  exportQuil() {
    let code = `# Quantum circuit in Quil\n`;
    code += `DECLARE mem BIT[${this.numQubits}]\n\n`;

    const sorted = [...this.gates].sort((a, b) => a.col - b.col);
    sorted.forEach((g) => {
      switch (g.gate) {
        case "h":
          code += `H ${g.qubit}\n`;
          break;
        case "x":
          code += `X ${g.qubit}\n`;
          break;
        case "y":
          code += `Y ${g.qubit}\n`;
          break;
        case "z":
          code += `Z ${g.qubit}\n`;
          break;
        case "s":
          code += `S ${g.qubit}\n`;
          break;
        case "t":
          code += `T ${g.qubit}\n`;
          break;
        case "rx":
          const rxAngle = g.params?.angle || Math.PI / 2;
          code += `RX(${rxAngle}) ${g.qubit}\n`;
          break;
        case "ry":
          const ryAngle = g.params?.angle || Math.PI / 2;
          code += `RY(${ryAngle}) ${g.qubit}\n`;
          break;
        case "rz":
          const rzAngle = g.params?.angle || Math.PI / 2;
          code += `RZ(${rzAngle}) ${g.qubit}\n`;
          break;
        case "cx":
          code += `CNOT ${g.qubit} ${g.qubit + 1}\n`;
          break;
        case "cz":
          code += `CZ ${g.qubit} ${g.qubit + 1}\n`;
          break;
        case "measure":
          code += `MEASURE ${g.qubit} mem[${g.qubit}]\n`;
          break;
      }
    });
    return code;
  }

  simulateStateVector() {
    if (this.numQubits > 4) throw new Error("Simulation limited to 4 qubits");
    const dim = 1 << this.numQubits;
    let state = Array(dim).fill(0).map(() => new Complex(0, 0));
    state[0] = new Complex(1, 0);

    const orderedGates = [...this.gates].sort((a, b) => a.col - b.col);

    for (const g of orderedGates) {
      if (SINGLE_QUBIT_GATES[g.gate]) {
        state = applySingleQubitGate(state, this.numQubits, g.qubit, SINGLE_QUBIT_GATES[g.gate]);
      } else if (g.gate === "cx") {
        state = applyCX(state, this.numQubits, g.qubit, g.qubit + 1);
      } else if (g.gate === "cz") {
        state = applyCZ(state, this.numQubits, g.qubit, g.qubit + 1);
      }
    }

    return state;
  }

  probabilityDistribution() {
    try {
      const state = this.simulateStateVector();
      const probs = {};
      state.forEach((amp, idx) => {
        const bin = idx.toString(2).padStart(this.numQubits, "0");
        probs[bin] = Complex.magnitudeSquared(amp);
      });
      return probs;
    } catch (e) {
      const states = Math.pow(2, this.numQubits);
      const probs = {};
      for (let i = 0; i < states; i++) {
        const state = i.toString(2).padStart(this.numQubits, '0');
        probs[state] = i === 0 ? 1 : 0;
      }
      return probs;
    }
  }
}

//------------------------------------------------------------
// Code Parsers
//------------------------------------------------------------
class CodeParsers {
  static parseQASM(code) {
    const gates = [];
    const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#') && !line.startsWith('//'));
    
    let numQubits = 3;
    let currentCol = 0;
    
    for (const line of lines) {
      if (line.includes('qreg q[')) {
        const match = line.match(/qreg q\[(\d+)\]/);
        if (match) numQubits = parseInt(match[1]);
        continue;
      }
      
      if (line.startsWith('OPENQASM') || line.startsWith('include') || line.startsWith('creg')) continue;
      
      // Parse gates
      if (line.match(/^[hxyzst] q\[(\d+)\]/)) {
        const match = line.match(/^([hxyzst]) q\[(\d+)\]/);
        if (match) {
          gates.push({ gate: match[1], qubit: parseInt(match[2]), col: currentCol++ });
        }
      } else if (line.match(/^c[xz] q\[(\d+)\],q\[(\d+)\]/)) {
        const match = line.match(/^c([xz]) q\[(\d+)\],q\[(\d+)\]/);
        if (match) {
          gates.push({ gate: `c${match[1]}`, qubit: parseInt(match[2]), col: currentCol++ });
        }
      } else if (line.match(/^measure q\[(\d+)\]/)) {
        const match = line.match(/^measure q\[(\d+)\]/);
        if (match) {
          gates.push({ gate: 'measure', qubit: parseInt(match[1]), col: currentCol++ });
        }
      }
    }
    
    return { gates, numQubits };
  }

  static parseQiskit(code) {
    const gates = [];
    const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    
    let numQubits = 3;
    let currentCol = 0;
    
    for (const line of lines) {
      if (line.includes('QuantumRegister(')) {
        const match = line.match(/QuantumRegister\((\d+)/);
        if (match) numQubits = parseInt(match[1]);
        continue;
      }
      
      // Parse single qubit gates
      const singleMatch = line.match(/circuit\.([hxyzst])\(qr\[(\d+)\]\)/);
      if (singleMatch) {
        gates.push({ gate: singleMatch[1], qubit: parseInt(singleMatch[2]), col: currentCol++ });
        continue;
      }
      
      // Parse two qubit gates
      const twoMatch = line.match(/circuit\.(c[xz])\(qr\[(\d+)\], qr\[(\d+)\]\)/);
      if (twoMatch) {
        gates.push({ gate: twoMatch[1], qubit: parseInt(twoMatch[2]), col: currentCol++ });
        continue;
      }
      
      // Parse measure
      if (line.includes('circuit.measure')) {
        const measureMatch = line.match(/circuit\.measure\(qr\[(\d+)\]/);
        if (measureMatch) {
          gates.push({ gate: 'measure', qubit: parseInt(measureMatch[1]), col: currentCol++ });
        }
      }
    }
    
    return { gates, numQubits };
  }

  static parseCirq(code) {
    const gates = [];
    const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    
    let numQubits = 3;
    let currentCol = 0;
    
    // Count qubits
    const qubitLines = lines.filter(line => line.match(/q\d+ = cirq\.GridQubit/));
    if (qubitLines.length > 0) numQubits = qubitLines.length;
    
    for (const line of lines) {
      // Parse single qubit gates
      const singleMatch = line.match(/circuit\.append\(cirq\.([HXYZT])\(q(\d+)\)\)/);
      if (singleMatch) {
        gates.push({ gate: singleMatch[1].toLowerCase(), qubit: parseInt(singleMatch[2]), col: currentCol++ });
        continue;
      }
      
      // Parse two qubit gates
      const cnotMatch = line.match(/circuit\.append\(cirq\.CNOT\(q(\d+), q(\d+)\)\)/);
      if (cnotMatch) {
        gates.push({ gate: 'cx', qubit: parseInt(cnotMatch[1]), col: currentCol++ });
        continue;
      }
      
      const czMatch = line.match(/circuit\.append\(cirq\.CZ\(q(\d+), q(\d+)\)\)/);
      if (czMatch) {
        gates.push({ gate: 'cz', qubit: parseInt(czMatch[1]), col: currentCol++ });
        continue;
      }
      
      // Parse measure
      if (line.includes('cirq.measure')) {
        const measureMatch = line.match(/circuit\.append\(cirq\.measure\(q(\d+)\)\)/);
        if (measureMatch) {
          gates.push({ gate: 'measure', qubit: parseInt(measureMatch[1]), col: currentCol++ });
        }
      }
    }
    
    return { gates, numQubits };
  }

  static parseQSharp(code) {
    const gates = [];
    const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//'));
    
    let numQubits = 3;
    let currentCol = 0;
    
    for (const line of lines) {
      if (line.includes('Qubit[')) {
        const match = line.match(/Qubit\[(\d+)\]/);
        if (match) numQubits = parseInt(match[1]);
        continue;
      }
      
      // Parse gates
      const gateMatch = line.match(/([HXYZT])\(qubits\[(\d+)\]\)/);
      if (gateMatch) {
        gates.push({ gate: gateMatch[1].toLowerCase(), qubit: parseInt(gateMatch[2]), col: currentCol++ });
        continue;
      }
      
      const cnotMatch = line.match(/CNOT\(qubits\[(\d+)\], qubits\[(\d+)\]\)/);
      if (cnotMatch) {
        gates.push({ gate: 'cx', qubit: parseInt(cnotMatch[1]), col: currentCol++ });
        continue;
      }
      
      const czMatch = line.match(/CZ\(qubits\[(\d+)\], qubits\[(\d+)\]\)/);
      if (czMatch) {
        gates.push({ gate: 'cz', qubit: parseInt(czMatch[1]), col: currentCol++ });
        continue;
      }
      
      if (line.includes('M(qubits[')) {
        const measureMatch = line.match(/M\(qubits\[(\d+)\]\)/);
        if (measureMatch) {
          gates.push({ gate: 'measure', qubit: parseInt(measureMatch[1]), col: currentCol++ });
        }
      }
    }
    
    return { gates, numQubits };
  }

  static parseQuil(code) {
    const gates = [];
    const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    
    let numQubits = 3;
    let currentCol = 0;
    
    for (const line of lines) {
      if (line.includes('DECLARE mem BIT[')) {
        const match = line.match(/DECLARE mem BIT\[(\d+)\]/);
        if (match) numQubits = parseInt(match[1]);
        continue;
      }
      
      // Parse single qubit gates
      const singleMatch = line.match(/^([HXYZT]) (\d+)$/);
      if (singleMatch) {
        gates.push({ gate: singleMatch[1].toLowerCase(), qubit: parseInt(singleMatch[2]), col: currentCol++ });
        continue;
      }
      
      // Parse two qubit gates
      const cnotMatch = line.match(/^CNOT (\d+) (\d+)$/);
      if (cnotMatch) {
        gates.push({ gate: 'cx', qubit: parseInt(cnotMatch[1]), col: currentCol++ });
        continue;
      }
      
      const czMatch = line.match(/^CZ (\d+) (\d+)$/);
      if (czMatch) {
        gates.push({ gate: 'cz', qubit: parseInt(czMatch[1]), col: currentCol++ });
        continue;
      }
      
      // Parse measure
      const measureMatch = line.match(/^MEASURE (\d+)/);
      if (measureMatch) {
        gates.push({ gate: 'measure', qubit: parseInt(measureMatch[1]), col: currentCol++ });
      }
    }
    
    return { gates, numQubits };
  }

  static parse(code, language) {
    try {
      switch (language) {
        case 'qasm': return this.parseQASM(code);
        case 'qiskit': return this.parseQiskit(code);
        case 'cirq': return this.parseCirq(code);
        case 'qsharp': return this.parseQSharp(code);
        case 'quil': return this.parseQuil(code);
        default: throw new Error('Unsupported language');
      }
    } catch (error) {
      throw new Error(`Parse error: ${error.message}`);
    }
  }
}

//------------------------------------------------------------
// Linear algebra helpers
//------------------------------------------------------------
function applySingleQubitGate(state, n, target, matrix) {
  const dim = state.length;
  const newState = state.map(() => new Complex(0, 0));
  const bit = 1 << (n - 1 - target);
  
  for (let i = 0; i < dim; i++) {
    if ((i & bit) === 0) {
      const idx0 = i;
      const idx1 = i | bit;
      const amp0 = state[idx0];
      const amp1 = state[idx1];

      const new0 = Complex.add(
        Complex.mul(matrix[0][0], amp0),
        Complex.mul(matrix[0][1], amp1)
      );
      const new1 = Complex.add(
        Complex.mul(matrix[1][0], amp0),
        Complex.mul(matrix[1][1], amp1)
      );
      newState[idx0] = new0;
      newState[idx1] = new1;
    }
  }
  return newState;
}

function applyCX(state, n, control, target) {
  const dim = state.length;
  const newState = state.map((c) => Complex.from(c));
  const cbit = 1 << (n - 1 - control);
  const tbit = 1 << (n - 1 - target);

  for (let i = 0; i < dim; i++) {
    if ((i & cbit) !== 0 && (i & tbit) === 0) {
      const idx0 = i;
      const idx1 = i | tbit;
      const temp = newState[idx0];
      newState[idx0] = newState[idx1];
      newState[idx1] = temp;
    }
  }
  return newState;
}

function applyCZ(state, n, control, target) {
  const dim = state.length;
  const newState = state.map((c) => Complex.from(c));
  const cbit = 1 << (n - 1 - control);
  const tbit = 1 << (n - 1 - target);
  
  for (let i = 0; i < dim; i++) {
    if ((i & cbit) !== 0 && (i & tbit) !== 0) {
      newState[i] = Complex.mul(newState[i], new Complex(-1, 0));
    }
  }
  return newState;
}

//------------------------------------------------------------
// Global variables
//------------------------------------------------------------
let circuit;
let codeEditor;
let importEditor;
let blochScene, blochCamera, blochRenderer, blochVector, blochArrow;
let resultsChart;
let currentTab = 'code';
let blochInitialized = false;
let resultsInitialized = false;
let selectedGate = null;

//------------------------------------------------------------
// Initialization
//------------------------------------------------------------
window.addEventListener("DOMContentLoaded", async () => {
    // 1. Check for temporary load state (from recent circuits)
    const tempLoadStateJSON = localStorage.getItem('qosmos_tempLoadCircuitState');
    let loadState = null;
    
    if (tempLoadStateJSON) {
        try {
            loadState = JSON.parse(tempLoadStateJSON);
            // IMPORTANT: Clear the temporary state immediately after reading it
            localStorage.removeItem('qosmos_tempLoadCircuitState'); 
        } catch (e) {
            console.error("Failed to parse temporary circuit state:", e);
        }
    }
    
    // 2. Fallback to current session state (autosave)
    if (!loadState) {
        const sessionStateJSON = localStorage.getItem('currentCircuitState');
        if (sessionStateJSON) {
            try {
                loadState = JSON.parse(sessionStateJSON);
            } catch (e) {
                console.error("Failed to parse circuit state from localStorage:", e);
            }
        }
    }
    
    // 3. Initialize the circuit
    // Create the global circuit instance with default values (3 qubits, 8 cols)
    circuit = new SimpleQuantumCircuit(3, 8);
    
    if (loadState && loadState.gates && loadState.gates.length > 0) {
        // Overwrite defaults with loaded state
        circuit.numQubits = loadState.qubits || 3;
        circuit.gates = loadState.gates;
        circuit.numCols = Math.max(8, loadState.gates.length + 2); // Adjust columns for circuit depth
        
        // Restore history if available for proper undo functionality
        if (loadState.history && loadState.history.length > 0) {
            circuit.history = loadState.history;
        }
        
        // Restore redo stack if available for redo functionality
        if (loadState.redoStack && loadState.redoStack.length > 0) {
            circuit.redoStack = loadState.redoStack;
        }
        
        // Update the qubit count display
        const qubitCountElement = document.getElementById('qubitCount');
        if (qubitCountElement) {
             qubitCountElement.textContent = circuit.numQubits;
        }
        
    }
  
    // Continue with the rest of the application initialization
    await setupEditors();
    buildGatePalette();
    setupTabs();
    setupToolbar();
    setupImportPanel();
    drawCircuit();
    
    refreshCode();
});

//------------------------------------------------------------
// Monaco Editors
//------------------------------------------------------------
async function setupEditors() {
  return new Promise((resolve) => {
    if (typeof require === 'undefined') {
      const codeContainer = document.getElementById("codeEditor");
      codeContainer.innerHTML = '<textarea class="form-control" rows="15" readonly id="codeTextarea">// Loading...</textarea>';
      const importContainer = document.getElementById("importEditor");
      importContainer.innerHTML = '<textarea class="form-control" rows="8" id="importTextarea">// Paste quantum code here</textarea>';
      resolve();
      return;
    }

    require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs" } });
    require(["vs/editor/editor.main"], () => {
      try {
        codeEditor = monaco.editor.create(document.getElementById("codeEditor"), {
          value: "// Quantum code will appear here\n",
          language: "plaintext",
          theme: "vs-dark",
          readOnly: true,
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        });
        
        importEditor = monaco.editor.create(document.getElementById("importEditor"), {
          value: "// Paste quantum code here\n",
          language: "plaintext",
          theme: "vs-dark",
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        });
        
        refreshCode();
        resolve();
      } catch (e) {
        console.error("Monaco setup failed:", e);
        resolve();
      }
    });
  });
}

//------------------------------------------------------------
// Import Panel Setup
//------------------------------------------------------------
function setupImportPanel() {
  const visualiseBtn = document.getElementById("btnVisualise");
  const clearImportBtn = document.getElementById("btnClearImport");
  const importLangSelect = document.getElementById("importLangSelect");
  
  visualiseBtn.addEventListener("click", () => {
    visualiseFromCode();
  });
  
  clearImportBtn.addEventListener("click", () => {
    if (importEditor && typeof importEditor.setValue === 'function') {
      importEditor.setValue("// Paste quantum code here\n");
    } else {
      const textarea = document.getElementById("importTextarea");
      if (textarea) textarea.value = "// Paste quantum code here";
    }
    showImportStatus("Import cleared", "success");
  });
  
  importLangSelect.addEventListener("change", () => {
    updateImportEditorLanguage();
  });
  
  updateImportEditorLanguage();
}

function updateImportEditorLanguage() {
  const language = document.getElementById("importLangSelect").value;
  if (importEditor && typeof importEditor.setModelLanguage === 'function') {
    const monacoLanguage = language === 'qasm' ? 'plaintext' : 'python';
    monaco.editor.setModelLanguage(importEditor.getModel(), monacoLanguage);
  }
}

function visualiseFromCode() {
  const language = document.getElementById("importLangSelect").value;
  let code = "";
  
  if (importEditor && typeof importEditor.getValue === 'function') {
    code = importEditor.getValue();
  } else {
    const textarea = document.getElementById("importTextarea");
    if (textarea) code = textarea.value;
  }
  
  if (!code.trim() || code.trim() === "// Paste quantum code here") {
    showImportStatus("Please paste some quantum code first", "error");
    return;
  }
  
  try {
    showImportStatus("Parsing code...", "info");
    const visualiseBtn = document.getElementById("btnVisualise");
    visualiseBtn.classList.add("loading");
    
    setTimeout(() => {
      try {
        const { gates, numQubits } = CodeParsers.parse(code, language);
        
        // Update circuit
        circuit.clear();
        syncCircuitState()
        circuit.numQubits = numQubits;
        circuit.numCols = Math.max(8, gates.length + 2);
        
        // Add gates to circuit
        gates.forEach(g => {
          circuit.addGate(g.gate, g.qubit, g.col, g.params || {});
        });
        syncCircuitState();
        
        // Update visualizations
        drawCircuit();
        refreshCode();
        updateVisualizations();
        
        showImportStatus(`Successfully imported ${gates.length} gates on ${numQubits} qubits`, "success");
        showToastAsPopup(`Circuit imported from ${language.toUpperCase()}!`);
        
        // Switch to circuit view
        switchToTab('code');
        
      } catch (error) {
        showImportStatus(`Error: ${error.message}`, "error");
        showToastAsPopup(`Import failed: ${error.message}`, "error");
      } finally {
        visualiseBtn.classList.remove("loading");
      }
    }, 300); // Small delay for visual feedback
    
  } catch (error) {
    showImportStatus(`Error: ${error.message}`, "error");
    showToastAsPopup(`Import failed: ${error.message}`, "error");
  }
}

function showImportStatus(message, type) {
  const statusDiv = document.getElementById("importStatus");
  statusDiv.textContent = message;
  statusDiv.className = `import-status ${type}`;
}

//------------------------------------------------------------
// Gate Palette
//------------------------------------------------------------
function buildGatePalette() {
  const gates = [
    { name: "H", gate: "h" },
    { name: "X", gate: "x" },
    { name: "Y", gate: "y" },
    { name: "Z", gate: "z" },
    { name: "S", gate: "s" },
    { name: "T", gate: "t" },
    { name: "RX", gate: "rx", hasParams: true },
    { name: "RY", gate: "ry", hasParams: true },
    { name: "RZ", gate: "rz", hasParams: true },
    { name: "CX", gate: "cx" },
    { name: "CZ", gate: "cz" },
    { name: "M", gate: "measure" },
  ];
  
  const palette = document.getElementById("gatePalette");
  palette.innerHTML = "";
  
  gates.forEach((g) => {
    const tile = document.createElement("div");
    tile.className = `gate-tile gate-${g.gate}`;
    tile.textContent = g.name;
    tile.dataset.gate = g.gate;
    tile.draggable = true;
    tile.addEventListener("dragstart", onGateDragStart);
    tile.addEventListener("dragend", onGateDragEnd);
    tile.addEventListener("click", onPaletteTileClick);
    palette.appendChild(tile);
  });
}

function onPaletteTileClick(e) {
  const gate = e.currentTarget.dataset.gate;
  selectedGate = gate;

  // visual feedback for selection
  document.querySelectorAll('#gatePalette .gate-tile').forEach(t => t.classList.remove('selected'));
  e.currentTarget.classList.add('selected');

  showToastAsPopup(`${gate.toUpperCase()} selected — click a cell to place`, 'info');
}

function onGateDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.gate);
  e.target.classList.add("dragging");
  document.querySelector(".circuit-wrapper").classList.add("drag-over");
}

function onGateDragEnd(e) {
  e.target.classList.remove("dragging");
  document.querySelector(".circuit-wrapper").classList.remove("drag-over");
}

//------------------------------------------------------------
// Circuit Drawing (SVG)
//------------------------------------------------------------
function drawCircuit() {
  const canvas = document.getElementById("circuitCanvas");
  canvas.innerHTML = "";
  const width = circuit.numCols * 80 + 100;
  const height = circuit.numQubits * 80 + 60;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  
  // Check if dark mode is active for theme-aware colors
  const isDarkMode = document.body.classList.contains('theme-dark');

  // Qubit lines & labels
  for (let q = 0; q < circuit.numQubits; q++) {
    const y = 40 + q * 80;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", 60);
    line.setAttribute("y1", y);
    line.setAttribute("x2", width - 40);
    line.setAttribute("y2", y);
    // Use theme-aware line color for better visibility
    line.setAttribute("stroke", isDarkMode ? "#475569" : "var(--color-border)");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", 30);
    text.setAttribute("y", y + 5);
    // Use explicit color based on current theme instead of CSS variable
    text.setAttribute("fill", isDarkMode ? "#e2e8f0" : "var(--color-text)");
    text.setAttribute("font-size", "14");
    text.setAttribute("font-weight", "500");
    text.textContent = `q${q}`;
    svg.appendChild(text);
  }

  // Gates
  circuit.gates.forEach((g) => {
    const x = 60 + g.col * 80;
    const y = 40 + g.qubit * 80;

    if (g.gate === "cx" || g.gate === "cz") {
      const controlY = y;
      const targetY = 40 + (g.qubit + 1) * 80;
      
      // control dot
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", controlY);
      dot.setAttribute("r", 5);
      dot.setAttribute("fill", "#7c3aed");
      svg.appendChild(dot);
      
      // vertical line
      const vline = document.createElementNS("http://www.w3.org/2000/svg", "line");
      vline.setAttribute("x1", x);
      vline.setAttribute("y1", controlY);
      vline.setAttribute("x2", x);
      vline.setAttribute("y2", targetY);
      vline.setAttribute("stroke", "#7c3aed");
      vline.setAttribute("stroke-width", "2");
      svg.appendChild(vline);
      
      // target shape
      if (g.gate === "cx") {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", targetY);
        circle.setAttribute("r", 18);
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke", "#7c3aed");
        circle.setAttribute("stroke-width", "2");
        svg.appendChild(circle);
        
        const cross1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        cross1.setAttribute("x1", x - 10);
        cross1.setAttribute("y1", targetY);
        cross1.setAttribute("x2", x + 10);
        cross1.setAttribute("y2", targetY);
        cross1.setAttribute("stroke", "#7c3aed");
        cross1.setAttribute("stroke-width", "2");
        svg.appendChild(cross1);
        
        const cross2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        cross2.setAttribute("x1", x);
        cross2.setAttribute("y1", targetY - 10);
        cross2.setAttribute("x2", x);
        cross2.setAttribute("y2", targetY + 10);
        cross2.setAttribute("stroke", "#7c3aed");
        cross2.setAttribute("stroke-width", "2");
        svg.appendChild(cross2);
      } else if (g.gate === "cz") {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x - 18);
        rect.setAttribute("y", targetY - 18);
        rect.setAttribute("width", 36);
        rect.setAttribute("height", 36);
        rect.setAttribute("rx", 6);
        rect.setAttribute("fill", "none");
        rect.setAttribute("stroke", "#7c3aed");
        rect.setAttribute("stroke-width", "1");
        svg.appendChild(rect);
        
        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", x);
        txt.setAttribute("y", targetY + 5);
        txt.setAttribute("fill", "#7c3aed");
        txt.setAttribute("font-size", "12");
        txt.setAttribute("font-weight", "500");
        txt.setAttribute("text-anchor", "middle");
        txt.textContent = "Z";
        svg.appendChild(txt);
      }
    } else {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x - 18);
      rect.setAttribute("y", y - 18);
      rect.setAttribute("width", 36);
      rect.setAttribute("height", 36);
      rect.setAttribute("rx", 6);
      rect.setAttribute("fill", "#7c3aed");
      // Use theme-aware stroke color
      rect.setAttribute("stroke", isDarkMode ? "#334155" : "var(--color-border)");
      rect.setAttribute("stroke-width", "1");
      svg.appendChild(rect);

      const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      txt.setAttribute("x", x);
      txt.setAttribute("y", y + 6);
      txt.setAttribute("fill", "white");
      txt.setAttribute("font-size", "12");
      txt.setAttribute("font-weight", "500");
      txt.setAttribute("text-anchor", "middle");
      // Handle rotation gates with parameters
      if (g.gate === "rx" || g.gate === "ry" || g.gate === "rz") {
        const angle = g.params?.angle || Math.PI / 2;
        const angleStr = (angle / Math.PI).toFixed(1) + "π";
        txt.textContent = g.gate.toUpperCase().replace("MEASURE", "M") + "(" + angleStr + ")";
      } else {
        txt.textContent = g.gate.toUpperCase().replace("MEASURE", "M");
      }
      svg.appendChild(txt);
    }
  });

  // Drop zones
  for (let row = 0; row < circuit.numQubits; row++) {
    for (let col = 0; col < circuit.numCols; col++) {
      const zone = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      zone.setAttribute("x", 42 + col * 80);
      zone.setAttribute("y", 22 + row * 80);
      zone.setAttribute("width", 36);
      zone.setAttribute("height", 36);
      zone.setAttribute("fill", "transparent");
      zone.dataset.row = row;
      zone.dataset.col = col;
      // make interactive: ensure pointer events are enabled and cursor shows clickable
      zone.setAttribute('style', 'pointer-events: all; cursor: pointer;');
      // click / touch to place selected gate
      zone.addEventListener('click', onZoneClick);
      zone.addEventListener('touchstart', (ev) => { ev.preventDefault(); onZoneClick({ target: zone }); });
      // hover preview
      zone.addEventListener('mouseenter', () => showHoverAt(zone));
      zone.addEventListener('mousemove', () => moveHoverAt(zone));
      zone.addEventListener('mouseleave', hideHover);

      svg.appendChild(zone);
    }
  }

  // Hover preview rectangle (one shared element)
  const existingHover = svg.querySelector('#hoverPreview');
  if (!existingHover) {
    const hoverRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    hoverRect.setAttribute('id', 'hoverPreview');
    hoverRect.setAttribute('width', 36);
    hoverRect.setAttribute('height', 36);
    hoverRect.setAttribute('rx', 6);
    hoverRect.setAttribute('fill', 'rgba(255,255,255,0.08)');
    hoverRect.setAttribute('stroke', 'white');
    hoverRect.setAttribute('stroke-width', '1');
    hoverRect.style.display = 'none';
    svg.appendChild(hoverRect);
  }

  canvas.appendChild(svg);

  // Drag events for drop-zones
  canvas.querySelectorAll("rect[data-row]").forEach((zone) => {
    zone.addEventListener("dragover", (e) => e.preventDefault());
    zone.addEventListener("drop", onDropGate);
  });

  document.getElementById("circuitInfo").textContent = `${circuit.numQubits} qubits, ${circuit.numCols} columns`;
}

function onDropGate(e) {
  e.preventDefault();
  let gateName = '';
  try { gateName = e.dataTransfer.getData("text/plain"); } catch (err) { gateName = ''; }
  // fallback to click-selected gate when drag payload is empty
  if (!gateName && selectedGate) gateName = selectedGate;
  const row = parseInt(e.target.dataset.row, 10);
  const col = parseInt(e.target.dataset.col, 10);
  
  try {
    // Check if gate has parameters (rotation gates)
    if (gateName === 'rx' || gateName === 'ry' || gateName === 'rz') {
      const angle = prompt(`Enter rotation angle in radians (default: π/2 ≈ 1.57):`, Math.PI / 2);
      if (angle !== null) {
        const params = { angle: parseFloat(angle) || Math.PI / 2 };
        circuit.addGate(gateName, row, col, params);
      } else {
        return; // User cancelled
      }
    } else {
      circuit.addGate(gateName, row, col);
    }
    syncCircuitState();
    drawCircuit();
    refreshCode();
    updateVisualizations();
  } catch (err) {
    showToastAsPopup(err.message, "error");
  }
}

function onZoneClick(e) {
  const tgt = e.target;
  const row = parseInt(tgt.dataset.row, 10);
  const col = parseInt(tgt.dataset.col, 10);
  if (!Number.isFinite(row) || !Number.isFinite(col)) return;

  if (!selectedGate) {
    showToastAsPopup('Select a gate from the palette first', 'info');
    return;
  }

  const gate = selectedGate;
  try {
    // Check if gate has parameters (rotation gates)
    if (gate === 'rx' || gate === 'ry' || gate === 'rz') {
      const angle = prompt(`Enter rotation angle in radians (default: π/2 ≈ 1.57):`, Math.PI / 2);
      if (angle !== null) {
        const params = { angle: parseFloat(angle) || Math.PI / 2 };
        circuit.addGate(gate, row, col, params);
      } else {
        return; // User cancelled
      }
    } else {
      circuit.addGate(gate, row, col);
    }
    syncCircuitState();
    // clear selection
    document.querySelectorAll('#gatePalette .gate-tile').forEach(t => t.classList.remove('selected'));
    selectedGate = null;
    drawCircuit();
    refreshCode();
    updateVisualizations();
  } catch (err) {
    showToastAsPopup(err.message, 'error');
  }
}

function showHoverAt(zone) {
  const svg = zone.ownerSVGElement || zone.closest('svg');
  if (!svg) return;
  const hover = svg.querySelector('#hoverPreview');
  if (!hover) return;
  hover.setAttribute('x', zone.getAttribute('x'));
  hover.setAttribute('y', zone.getAttribute('y'));
  hover.style.display = 'block';
}

function moveHoverAt(zone) {
  // keep hover positioned on the zone; reserved for future mouse position uses
  showHoverAt(zone);
}

function hideHover() {
  const svgs = document.querySelectorAll('#circuitCanvas svg');
  svgs.forEach((svg) => {
    const hover = svg.querySelector('#hoverPreview');
    if (hover) hover.style.display = 'none';
  });
}

//------------------------------------------------------------
// Tabs and Toolbar
//------------------------------------------------------------
function setupTabs() {
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      switchToTab(target);
    });
  });
}

function switchToTab(target) {
  currentTab = target;
  
  document.querySelectorAll(".tab-button").forEach((b) => b.classList.remove("active"));
  document.querySelector(`[data-tab="${target}"]`).classList.add("active");
  
  // Hide all panels, then show the requested panel (fix stacked panels bug)
  document.querySelectorAll(".tab-panel").forEach((c) => c.classList.remove("active"));
  const panel = document.getElementById(`${target}Tab`);
  if (panel) panel.classList.add("active");
  
  if (target === 'bloch' && !blochInitialized) {
    setTimeout(() => {
      initBlochSphere();
      blochInitialized = true;
    }, 100);
  } else if (target === 'results' && !resultsInitialized) {
    setTimeout(() => {
      initResultsChart();
      resultsInitialized = true;
    }, 100);
  }
  
  if (target === 'bloch' && blochInitialized) {
    updateBlochSphereFromCircuit();
  } else if (target === 'results' && resultsInitialized) {
    updateResultsChart();
  }
}

function setupToolbar() {
  q("btnAddQubit").addEventListener("click", () => {
    circuit.numQubits++;
    drawCircuit();
    refreshCode();
    updateVisualizations();
  });
  
  q("btnRemoveQubit").addEventListener("click", () => {
    if (circuit.numQubits > 1) {
      circuit.numQubits--;
      circuit.gates = circuit.gates.filter((g) => g.qubit < circuit.numQubits);
      drawCircuit();
      refreshCode();
      updateVisualizations();
    }
  });
  
  q("btnUndo").addEventListener("click", () => {
    circuit.undo();
    syncCircuitState();
    drawCircuit();
    refreshCode();
    updateVisualizations();
  });
  
  q("btnRedo").addEventListener("click", () => {
    circuit.redo();
    syncCircuitState();
    drawCircuit();
    refreshCode();
    updateVisualizations();
  });
  
  q("btnClear").addEventListener("click", () => {
    circuit.clear();
    syncCircuitState()
    drawCircuit();
    refreshCode();
    updateVisualizations();
  });
  
  q("btnSimulate").addEventListener("click", () => {
    updateVisualizations();
  });

  if (q("codeLangSelect")) {
    q("codeLangSelect").addEventListener("change", refreshCode);
  }
  q("exportCodeBtn")?.addEventListener("click", exportCode);
}

//------------------------------------------------------------
// Refresh Code
//------------------------------------------------------------
function refreshCode() {
  const language = document.getElementById("codeLangSelect")?.value || 'qasm';
  const code = circuit.exportCode(language);
  
  if (codeEditor && typeof codeEditor.setValue === 'function') {
    codeEditor.setValue(code);
  } else {
    const textarea = document.getElementById("codeTextarea");
    if (textarea) {
      textarea.value = code;
    }
  }
}

//------------------------------------------------------------
// Visualization Updates
//------------------------------------------------------------
function updateVisualizations() {
  if (currentTab === 'bloch' && blochInitialized) {
    updateBlochSphereFromCircuit();
  } else if (currentTab === 'results' && resultsInitialized) {
    updateResultsChart();
  }
}

//------------------------------------------------------------
// Bloch Sphere (Three.js)
//------------------------------------------------------------
function initBlochSphere() {
  if (!window.THREE) {
    console.error("Three.js not loaded");
    document.getElementById("blochSphere").innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Three.js library not loaded</div>';
    return;
  }

  const container = document.getElementById("blochSphere");
  if (!container) return;
  
  container.innerHTML = "";
  
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  if (width === 0 || height === 0) {
    setTimeout(() => initBlochSphere(), 100);
    return;
  }
  
  blochScene = new THREE.Scene();
  blochCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  blochCamera.position.set(2.5, 2.5, 2.5);
  blochCamera.lookAt(0, 0, 0);
  
  blochRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  blochRenderer.setSize(width, height);
  blochRenderer.setClearColor(0x000000, 0);
  container.appendChild(blochRenderer.domElement);

  // Sphere wireframe
  const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
  const sphereMat = new THREE.MeshBasicMaterial({ 
    color: 0x666666, 
    wireframe: true, 
    opacity: 0.3, 
    transparent: true 
  });
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  blochScene.add(sphereMesh);

  // Coordinate axes
  const axisLen = 1.3;
  
  const xGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-axisLen, 0, 0), 
    new THREE.Vector3(axisLen, 0, 0)
  ]);
  const xLine = new THREE.Line(xGeo, new THREE.LineBasicMaterial({ color: 0xff0000 }));
  blochScene.add(xLine);
  
  const yGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -axisLen, 0), 
    new THREE.Vector3(0, axisLen, 0)
  ]);
  const yLine = new THREE.Line(yGeo, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
  blochScene.add(yLine);
  
  const zGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, -axisLen), 
    new THREE.Vector3(0, 0, axisLen)
  ]);
  const zLine = new THREE.Line(zGeo, new THREE.LineBasicMaterial({ color: 0x0000ff }));
  blochScene.add(zLine);

  const vecGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0), 
    new THREE.Vector3(0, 0, 1)
  ]);
  blochVector = new THREE.Line(vecGeo, new THREE.LineBasicMaterial({ 
    color: 0xff4444, 
    linewidth: 3 
  }));
  blochScene.add(blochVector);

  const arrowGeo = new THREE.ConeGeometry(0.05, 0.2, 8);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
  blochArrow = new THREE.Mesh(arrowGeo, arrowMat);
  blochArrow.position.set(0, 0, 1);
  blochScene.add(blochArrow);

  let isDragging = false;
  let prev = { x: 0, y: 0 };
  
  const onMouseDown = (e) => {
    isDragging = true;
    prev.x = e.clientX;
    prev.y = e.clientY;
  };
  
  const onMouseMove = (e) => {
    if (!isDragging) return;
    const dx = (e.clientX - prev.x) * 0.01;
    const dy = (e.clientY - prev.y) * 0.01;
    prev.x = e.clientX;
    prev.y = e.clientY;
    
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(blochCamera.position);
    spherical.theta -= dx;
    spherical.phi += dy;
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
    blochCamera.position.setFromSpherical(spherical);
    blochCamera.lookAt(0, 0, 0);
  };
  
  const onMouseUp = () => (isDragging = false);
  
  container.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  function animate() {
    requestAnimationFrame(animate);
    if (blochRenderer && blochScene && blochCamera) {
      blochRenderer.render(blochScene, blochCamera);
    }
  }
  animate();

  updateBlochSphereFromCircuit();
}

function updateBlochSphereFromCircuit() {
  if (!blochScene || !blochVector || !blochArrow) return;
  
  try {
    const stateVec = circuit.simulateStateVector();
    const alpha = reducedAmplitude(stateVec, circuit.numQubits, 0, 0);
    const beta = reducedAmplitude(stateVec, circuit.numQubits, 0, 1);
    
    const norm = Math.sqrt(Complex.magnitudeSquared(alpha) + Complex.magnitudeSquared(beta));
    if (norm === 0) return;
    
    const a = new Complex(alpha.re / norm, alpha.im / norm);
    const b = new Complex(beta.re / norm, beta.im / norm);

    const x = 2 * (a.re * b.re + a.im * b.im);
    const y = 2 * (a.im * b.re - a.re * b.im);
    const z = Complex.magnitudeSquared(a) - Complex.magnitudeSquared(b);

    blochVector.geometry.setFromPoints([
      new THREE.Vector3(0, 0, 0), 
      new THREE.Vector3(x, y, z)
    ]);

    blochArrow.position.set(x, y, z);
    if (x !== 0 || y !== 0 || z !== 0) {
      blochArrow.lookAt(new THREE.Vector3(x * 2, y * 2, z * 2));
    }

    document.getElementById("amplitude").textContent = `${a.toString()} , ${b.toString()}`;
    const phase = Math.atan2(a.im, a.re) * (180 / Math.PI);
    document.getElementById("phase").textContent = `${phase.toFixed(1)}°`;
    
    let stateName = "superposition";
    if (Math.abs(z - 1) < 0.01) stateName = "|0⟩";
    else if (Math.abs(z + 1) < 0.01) stateName = "|1⟩";
    else if (Math.abs(x - 1) < 0.01) stateName = "|+⟩";
    else if (Math.abs(x + 1) < 0.01) stateName = "|-⟩";
    else if (Math.abs(y - 1) < 0.01) stateName = "|+i⟩";
    else if (Math.abs(y + 1) < 0.01) stateName = "|-i⟩";
    
    document.getElementById("currentState").textContent = stateName;
  } catch (e) {
    console.error("Bloch sphere update failed:", e);
  }
}

function reducedAmplitude(state, n, qubit, bitVal) {
  let amp = new Complex(0, 0);
  const bit = 1 << (n - 1 - qubit);
  state.forEach((c, idx) => {
    if (((idx & bit) !== 0) === (bitVal === 1)) {
      amp = Complex.add(amp, c);
    }
  });
  return amp;
}

//------------------------------------------------------------
// Results Chart (Chart.js)
//------------------------------------------------------------
function initResultsChart() {
  if (!window.Chart) {
    console.error("Chart.js not loaded");
    document.getElementById("resultsChart").innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Chart.js library not loaded</div>';
    return;
  }
  
  updateResultsChart();
}

function updateResultsChart() {
  const canvas = document.getElementById("resultsChart");
  if (!canvas || !window.Chart) return;
  
  const probs = circuit.probabilityDistribution();
  const labels = Object.keys(probs);
  const data = labels.map((k) => probs[k]);
  const colors = [
    "#1FB8CD", "#FFC185", "#B4413C", "#ECEBD5", "#5D878F", 
    "#DB4545", "#D2BA4C", "#964325", "#944454", "#13343B"
  ];
  
  if (resultsChart) {
    resultsChart.destroy();
  }
  
  resultsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels.map(l => `|${l}⟩`),
      datasets: [{
        label: "Probability",
        data,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderWidth: 1,
        borderColor: labels.map((_, i) => colors[i % colors.length]),
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500,
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${(ctx.parsed.y * 100).toFixed(2)}%`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: {
            callback: (value) => `${(value * 100).toFixed(0)}%`
          }
        },
        x: {
          title: {
            display: true,
            text: 'Quantum States'
          }
        }
      },
    },
  });
  
  updateStateTable(probs);
}

function updateStateTable(probs) {
  const tableDiv = document.getElementById("stateTable");
  if (!tableDiv) return;
  
  const entries = Object.entries(probs).sort((a, b) => b[1] - a[1]);
  let html = "<table><thead><tr><th>State</th><th>Probability</th><th>Amplitude</th></tr></thead><tbody>";
  
  entries.forEach(([state, p]) => {
    const amp = Math.sqrt(p);
    html += `<tr><td>|${state}⟩</td><td>${(p * 100).toFixed(2)}%</td><td>${amp.toFixed(3)}</td></tr>`;
  });
  
  html += "</tbody></table>";
  tableDiv.innerHTML = html;
}

//------------------------------------------------------------
// Utilities
//------------------------------------------------------------
function q(id) {
  return document.getElementById(id);
}

function showToastAsPopupAsPopup(msg) {
    const el = document.createElement("div");
    el.className = "toast-popup";
    el.innerHTML = `<div class="toast">${msg}</div>`;

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 2500); // auto-close
}


// =============================
// Theme + Top-nav + Auth (lightweight)
// Based on implementations in app.js, with Firebase fallbacks
// =============================

function applyTheme() {
  const theme = localStorage.getItem('quantum-theme') || 'light';
  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(`theme-${theme}`);
  updateThemeToggle();
  // Redraw circuit to update colors for dark mode
  if (typeof circuit !== 'undefined') {
    drawCircuit();
  }
}

function toggleTheme() {
  const current = localStorage.getItem('quantum-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  localStorage.setItem('quantum-theme', next);
  applyTheme();
}

function updateThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  const theme = localStorage.getItem('quantum-theme') || 'light';
  themeToggle.classList.toggle('light', theme === 'light');
  themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
}

// Simple app-level user state used when Firebase isn't present
let appCurrentUser = null;

function checkAuthState() {
  // Ensure firebase is initialised on this page if library available
  if (window.firebase) {
    try {
      if (!firebase.apps || firebase.apps.length === 0) {
        // Initialize using same project config as the main app (safe to duplicate for local pages)
        const _cfg = {
          apiKey: "AIzaSyAZdM3H6_7WptYaEe3Jl7BML1rEp9XtZXE",
          authDomain: "quantum-computing-simulator.firebaseapp.com",
          projectId: "quantum-computing-simulator",
          storageBucket: "quantum-computing-simulator.firebasestorage.app",
          messagingSenderId: "243542374418",
          appId: "1:243542374418:web:50af11fcb3ded5411d80cb",
          measurementId: "G-5FP233Q20E"
        };
        try { firebase.initializeApp(_cfg); } catch (err) { /* ignore if already */ }
      }

      firebase.auth().onAuthStateChanged((user) => {
        appCurrentUser = user;
        updateNavigation(!!user);
        updateUserProfile();
      });
      return;
    } catch (e) {
      console.warn('Firebase init failed on this page', e);
    }
  }

  // Fallback: localStorage-based mock user
  const saved = localStorage.getItem('qc-current-user');
  appCurrentUser = saved ? JSON.parse(saved) : null;
  updateNavigation(!!appCurrentUser);
  updateUserProfile();
}

async function handleLogin(event) {
  if (event && event.preventDefault) event.preventDefault();
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;

  if (!email) { showToastAsPopup('Please enter email', 'warning'); return; }

  if (window.firebase && firebase.auth) {
    try {
      showToastAsPopup('Signing in...', 'info');
      await firebase.auth().signInWithEmailAndPassword(email, password);
      // firebase auth listener will update UI
      document.getElementById('loginModal') && hideModal('loginModal');
    } catch (err) {
      showToastAsPopup(err.message || 'Login failed', 'error');
    }
  } else {
    // Mock login (for local dev without Firebase)
    appCurrentUser = { email, displayName: email.split('@')[0] };
    localStorage.setItem('qc-current-user', JSON.stringify(appCurrentUser));
    updateNavigation(true);
    updateUserProfile();
    document.getElementById('loginModal') && hideModal('loginModal');
    showToastAsPopup('Signed in (mock)', 'success');
  }
}

async function handleSignup(event) {
  if (event && event.preventDefault) event.preventDefault();
  const firstName = document.getElementById('signupFirstName')?.value || '';
  const lastName = document.getElementById('signupLastName')?.value || '';
  const email = document.getElementById('signupEmail')?.value;
  const password = document.getElementById('signupPassword')?.value;

  if (!email || !password) { showToastAsPopup('Please provide email and password', 'warning'); return; }

  if (window.firebase && firebase.auth) {
    try {
      showToastAsPopup('Creating account...', 'info');
      const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName: `${firstName} ${lastName}` });
      document.getElementById('signupModal') && hideModal('signupModal');
      showToastAsPopup('Account created', 'success');
    } catch (err) {
      showToastAsPopup(err.message || 'Signup failed', 'error');
    }
  } else {
    // Mock signup
    appCurrentUser = { email, displayName: `${firstName} ${lastName}`.trim() || email.split('@')[0] };
    localStorage.setItem('qc-current-user', JSON.stringify(appCurrentUser));
    updateNavigation(true);
    updateUserProfile();
    document.getElementById('signupModal') && hideModal('signupModal');
    showToastAsPopup('Account created (mock)', 'success');
  }
}

async function signInWithGoogle() {
  if (window.firebase && firebase.auth) {
    try {
      showToastAsPopup('Signing in with Google...', 'info');
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().signInWithPopup(provider);
      hideAllModals();
    } catch (err) {
      showToastAsPopup(err.message || 'Google sign-in failed', 'error');
    }
  } else {
    // Mock: create a fake Google user
    appCurrentUser = { email: 'google.user@example.com', displayName: 'Google User' };
    localStorage.setItem('qc-current-user', JSON.stringify(appCurrentUser));
    updateNavigation(true);
    updateUserProfile();
    hideAllModals && hideAllModals();
    showToastAsPopup('Signed in with Google (mock)', 'success');
  }
}

async function signOut() {
  if (window.firebase && firebase.auth) {
    try {
      await firebase.auth().signOut();
      showToastAsPopup('Signed out', 'success');
    } catch (err) {
      showToastAsPopup(err.message || 'Sign out failed', 'error');
    }
  } else {
    appCurrentUser = null;
    localStorage.removeItem('qc-current-user');
    updateNavigation(false);
    updateUserProfile();
    showToastAsPopup('Signed out (mock)', 'success');
  }
}

function updateNavigation(isLoggedIn) {
  const publicNav = document.getElementById('publicNav');
  const privateNav = document.getElementById('privateNav');
  const userMenu = document.getElementById('userMenu');

  if (isLoggedIn) {
    publicNav && publicNav.classList.add('hidden');
    privateNav && privateNav.classList.remove('hidden');
    userMenu && userMenu.classList.remove('hidden');
  } else {
    publicNav && publicNav.classList.remove('hidden');
    privateNav && privateNav.classList.add('hidden');
    userMenu && userMenu.classList.add('hidden');
  }
}

function updateUserProfile() {
  const user = (window.firebase && firebase.auth && firebase.auth().currentUser) || appCurrentUser;
  if (!user) return;

  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const userAvatar = document.getElementById('userAvatar');
  const dashboardUserName = document.getElementById('dashboardUserName');

  if (userName) userName.textContent = user.displayName || user.email || 'User';
  if (userEmail) userEmail.textContent = user.email || '';
  if (userAvatar) userAvatar.textContent = (user.displayName || user.email || 'U')[0].toUpperCase();
  if (dashboardUserName) dashboardUserName.textContent = (user.displayName || user.email || 'User').split(' ')[0];
}

function setupTopNavAuth() {
  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

  // Auth buttons
  document.getElementById('loginBtn')?.addEventListener('click', () => showModal && showModal('loginModal'));
  document.getElementById('signupBtn')?.addEventListener('click', () => showModal && showModal('signupModal'));
  document.getElementById('logoutBtn')?.addEventListener('click', signOut);

  // Form handlers
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('signupForm')?.addEventListener('submit', handleSignup);

  // Google auth
  document.getElementById('loginGoogleBtn')?.addEventListener('click', signInWithGoogle);
  document.getElementById('signupGoogleBtn')?.addEventListener('click', signInWithGoogle);

  // Initialize state
  applyTheme();
  checkAuthState();
}

// Wire up on DOM ready (safe to call even if already present earlier)
document.addEventListener('DOMContentLoaded', () => {
  try { setupTopNavAuth(); } catch (e) { /* non-fatal */ }
});

// app1.js - Add this helper function

function syncCircuitState() {
    // Uses the global 'circuit' instance managed by app1.js
    if (typeof circuit === 'undefined') return; 

    const state = {
        qubits: circuit.numQubits,
        // Ensure you are using the correct array property name (gates)
        gates: circuit.gates,
        // Also save the history for proper undo functionality
        history: circuit.history,
        // Save redo stack for redo functionality
        redoStack: circuit.redoStack
    };
    localStorage.setItem('currentCircuitState', JSON.stringify(state));
    console.log('State saved to localStorage.');
}

function getFileExtension(language) {
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
function exportCode() {
    console.log('Export button clicked');
    
    // circuit is a global variable initialized by app1.js
    if (circuit.gates.length === 0) {
        showToastAsPopup('Add gates before exporting.', 'warning');
        return;
    }

    // Call the existing function to regenerate code based on the selected language
    refreshCode(); 
    
    // Try to retrieve code from either the Monaco editor or the fallback textarea
    const codeEditor = document.getElementById('codeEditor');
    const codeTextarea = document.getElementById('codeTextarea'); 
    
    let code = '';
    
    // 1. Try to get code from Monaco Editor (if initialized, using its getValue function)
    if (codeEditor && typeof codeEditor.getValue === 'function') {
        code = codeEditor.getValue();
    } 
    // 2. Fallback to the textarea content (for non-Monaco environments)
    else if (codeTextarea) {
        code = codeTextarea.value;
    } 
    // 3. Last fallback: try getting content from the rendered pre/code block
    else if (codeEditor) {
        code = codeEditor.textContent;
    }
    
    if (!code || code.trim() === '' || code.includes('// Generated code will appear here')) {
        showToastAsPopup('Code content is empty or incomplete.', 'error');
        return;
    }

    // Determine language and extension
    const language = document.getElementById("codeLangSelect")?.value || 'qiskit';
    const extension = getFileExtension(language);
    const filename = `quantum_circuit.${extension}`;

    try {
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

        showToastAsPopup(`Exported successfully as ${filename}!`, 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showToastAsPopup('Export failed: ' + error.message, 'error');
    }
}