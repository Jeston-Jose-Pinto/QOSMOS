// Enhanced Quantum Circuit Builder script (replaces previous app.js)

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
  }

  addGate(gate, qubit, col, params = {}) {
    if (qubit >= this.numQubits) throw new Error("Invalid qubit index");
    if ((gate === 'cx' || gate === 'cz') && qubit + 1 >= this.numQubits) {
      throw new Error("Not enough qubits for two-qubit gate");
    }
    this.gates.push({ gate, qubit, col, params });
    this.history.push(JSON.parse(JSON.stringify(this.gates)));
  }

  clear() {
    this.gates = [];
    this.history = [[]];
  }

  undo() {
    if (this.history.length > 1) {
      this.history.pop();
      this.gates = JSON.parse(JSON.stringify(this.history[this.history.length - 1]));
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
          code += `            T(qubits[${g.qubit}]);\n`;
          break;
        case "cx":
          code += `            CNOT(qubits[${g.qubit}], qubits[${g.qubit + 1}]);\n`;
          break;
        case "cz":
          code += `            CZ(qubits[${g.qubit}], qubits[${g.qubit + 1}]);\n`;
          break;
        case "measure":
          code += `            M(qubits[${g.qubit}]);\n`;
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
    // If the new QuantumPlatform UI is present (multiple dedicated gate sections),
    // skip the legacy SimpleQuantumCircuit initialization to avoid running two
    // incompatible renderers at the same time which causes drag/drop to break.
    if (document.getElementById('singleQubitGates') || document.getElementById('rotationGates') || document.getElementById('twoQubitGates')) {
        console.log('New builder UI detected — skipping legacy circuit initialization');
        return;
    }

    circuit = new SimpleQuantumCircuit(3, 8);
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
    showToastAsPopup("⚠️ Cannot import: Please paste quantum code first", "warning");
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
        circuit.numQubits = numQubits;
        circuit.numCols = Math.max(8, gates.length + 2);
        
        // Add gates to circuit
        gates.forEach(g => {
          circuit.addGate(g.gate, g.qubit, g.col, g.params || {});
        });
        
        // Update visualizations
        drawCircuit();
        refreshCode();
        updateVisualizations();
        
        showImportStatus(`Successfully imported ${gates.length} gates on ${numQubits} qubits`, "success");
        showToastAsPopup(`✅ Circuit imported from ${language.toUpperCase()}!`, "success");
        
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
    { name: "CX", gate: "cx" },
    { name: "CZ", gate: "cz" },
    { name: "M", gate: "measure" },
  ];
  
  const palette = document.getElementById("gatePalette");
  if (!palette) return;
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

function onGateDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.gate);
    try { e.dataTransfer.effectAllowed = 'copy'; } catch (err) {}
  e.target.classList.add("dragging");
  const wrapper = document.querySelector(".circuit-wrapper") || document.body;
  wrapper.classList.add("drag-over");
}

function onGateDragEnd(e) {
  e.target.classList.remove("dragging");
  const wrapper = document.querySelector(".circuit-wrapper") || document.body;
  wrapper.classList.remove("drag-over");
}

function onPaletteTileClick(e) {
    const gate = e.currentTarget.dataset.gate;
    selectedGate = gate;

    // visual feedback for selection
    document.querySelectorAll('#gatePalette .gate-tile').forEach(t => t.classList.remove('selected'));
    e.currentTarget.classList.add('selected');

}

//------------------------------------------------------------
// Circuit Drawing (SVG)
//------------------------------------------------------------
// Detect whether the new QuantumPlatform builder UI is present.
function isNewBuilderUI() {
    return !!(document.getElementById('gatePalette') || document.getElementById('singleQubitGates') || document.querySelector('.circuit-grid'));
}

function onDropGate(e) {
  e.preventDefault();
    // If the new builder UI is present, let its handlers manage drops
    if (isNewBuilderUI()) return;
    let gateName = '';
    try { gateName = e.dataTransfer.getData("text/plain"); } catch (err) { gateName = ''; }
    // Fallback to click-selected gate if drag payload empty
    if (!gateName && selectedGate) gateName = selectedGate;
  const row = parseInt(e.target.dataset.row, 10);
  const col = parseInt(e.target.dataset.col, 10);
  
  try {
    circuit.addGate(gateName, row, col);
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
        circuit.addGate(gate, row, col);
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

// Allow deleting a gate by dragging it away from the circuit (drop outside the #circuitCanvas)
// Global drag handlers to enable a visible trash target and require dropping onto it to delete
document.addEventListener('dragover', (e) => {
    // If new builder UI is present, don't run legacy global handlers
    if (isNewBuilderUI()) return;
    // allow drops anywhere so we can inspect the final drop target (but don't delete here)
    e.preventDefault();
    // highlight trash bin when hovering above it
    const trash = document.getElementById('trashBin');
    if (trash) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (el && el.closest && el.closest('#trashBin')) {
            trash.classList.add('trash-active');
        } else {
            trash.classList.remove('trash-active');
        }
    }
});

document.addEventListener('dragleave', (e) => {
    if (isNewBuilderUI()) return;
    const trash = document.getElementById('trashBin');
    if (trash) trash.classList.remove('trash-active');
});

document.addEventListener('drop', (e) => {
    // If new builder UI is present, skip legacy drop handling entirely
    if (isNewBuilderUI()) return;

    // Ensure trash highlight cleared
    const trash = document.getElementById('trashBin');
    if (trash) trash.classList.remove('trash-active');

    // If drop happens inside the canvas, let local handlers deal with it
    const insideCanvas = !!e.target.closest && !!e.target.closest('#circuitCanvas');

    // Try to read JSON payload for move-gate
    let payload = null;
    try {
        const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
        if (raw) payload = JSON.parse(raw);
    } catch (err) {
        // ignore parse errors
    }

    // Determine if the drop location is the trash bin (require explicit trash drop for deletion)
    let droppedOnTrash = false;
    try {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (el && (el.id === 'trashBin' || (el.closest && el.closest('#trashBin')))) droppedOnTrash = true;
    } catch (err) {
        // ignore
    }

    if (payload && payload.type === 'move-gate' && droppedOnTrash) {
        // Remove the gate from circuit
        const idx = circuit.gates.findIndex(g => g.qubit === payload.qubit && (g.col === payload.col || g.col === payload.col) && (g.gate === payload.gate || g.gate === payload.gate));
        if (idx !== -1) {
            circuit.gates.splice(idx, 1);
            drawCircuit();
            refreshCode();
            updateVisualizations();
            e.preventDefault();
        }
    }
});

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
  
    // hide all panels, then show the one requested
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
  const addBtn = q("btnAddQubit");
  const removeBtn = q("btnRemoveQubit");
  
  if (!addBtn || !removeBtn) return; // Don't setup if elements don't exist
  
  addBtn.addEventListener("click", () => {
    circuit.numQubits++;
    drawCircuit();
    refreshCode();
    updateVisualizations();
  });
  
  removeBtn.addEventListener("click", () => {
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
    drawCircuit();
    refreshCode();
    updateVisualizations();
    showToastAsPopup("Undone");
  });
  
  
  q("btnClear").addEventListener("click", () => {
    circuit.clear();
    drawCircuit();
    refreshCode();
    updateVisualizations();
  });
  
  q("btnSimulate").addEventListener("click", () => {
    updateVisualizations();
    showToastAsPopup("Circuit simulated!");
  });

  if (q("codeLangSelect")) {
    q("codeLangSelect").addEventListener("change", refreshCode);
  }
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
    const el = document.getElementById("resultsChart");
    if (el) el.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Chart.js library not loaded</div>';
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
        "#7c3aed", "#8b5cf6", "#c4b5fd", "#efe6ff", "#a78bfa",
        "#7c3aed", "#d8b4fe", "#6d28d9", "#8b5cf6", "#4c1d95"
    ];
  
  if (resultsChart) {
    resultsChart.destroy();
  }
  
  resultsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels.map(l => `|${l}⟩`),
                datasets: [{
                    label: 'Probability',
                    data: data,
                    // Purple theme
                    backgroundColor: 'rgba(124, 58, 237, 0.6)',
                    borderColor: 'rgba(124, 58, 237, 1)',
                    borderWidth: 1
                }]
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

function showToastAsPopup(msg, type = "success") {
  const div = document.createElement("div");
  div.className = `status-indicator ${type}`;
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3500);
}

// Show a toast with an Undo button. undoCallback will be called if user clicks Undo.
function showUndoToast(msg, undoCallback, timeout = 5000) {
    const div = document.createElement('div');
    div.className = 'status-indicator info undo-toast';
    const text = document.createElement('span');
    text.textContent = msg;
    div.appendChild(text);

    const btn = document.createElement('button');
    btn.className = 'undo-btn';
    btn.textContent = 'Undo';
    btn.addEventListener('click', () => {
        try {
            undoCallback();
        } catch (err) {
            console.error('Undo failed', err);
        }
        clearTimeout(timer);
        div.remove();
    });
    div.appendChild(btn);

    document.body.appendChild(div);
    const timer = setTimeout(() => {
        div.remove();
    }, timeout);
}
// Quantum Computing Platform - Complete Professional JavaScript Implementation

class QuantumPlatform {
    constructor() {
        // Firebase Configuration
        this.firebaseConfig = {
            apiKey: "AIzaSyAZdM3H6_7WptYaEe3Jl7BML1rEp9XtZXE",
  authDomain: "quantum-computing-simulator.firebaseapp.com",
  projectId: "quantum-computing-simulator",
  storageBucket: "quantum-computing-simulator.firebasestorage.app",
  messagingSenderId: "243542374418",
  appId: "1:243542374418:web:50af11fcb3ded5411d80cb",
  measurementId: "G-5FP233Q20E"
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
        this.currentCircuitId = null;
        this.circuitTitle=null;

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
        
        // Initialize current page based on the current HTML file
        const currentPageFile = window.location.pathname.split('/').pop().replace('.html', '');
        const pageMap = {
            'index': 'home',
            'dashboard': 'dashboard',
            'circuit-builder': 'builder',
            'my-circuits': 'my-circuits'
        };
        
        this.currentPage = pageMap[currentPageFile] || 'home';
        this.updateNavigationLinks();
        this.initializeCurrentPage();
    }

    initializeFirebase() {
        if (typeof firebase !== 'undefined') {
            if (!firebase.apps || firebase.apps.length === 0) {
                firebase.initializeApp(this.firebaseConfig);
            }
            this.auth = firebase.auth();
            this.db = firebase.firestore();

            // Listen to auth state changes
            this.auth.onAuthStateChanged((user) => {
        if (user) {
            this.currentUser = user;
            this.updateNavigation(true);
            this.loadUserStats();
            
            // 🆕 Add conditional circuit loading here
            if (window.location.pathname.split('/').pop() === 'dashboard.html') {
                this.loadRecentCircuits(); 
            }

        } else {
            this.currentUser = null;
            this.updateNavigation(false);
            // Optional: Call to handle the logged-out state on the dashboard
            if (window.location.pathname.split('/').pop() === 'dashboard.html') {
                this.displayRecentCircuits([]); 
            }
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

        // User menu dropdown
        const userAvatar = document.getElementById('userAvatar');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userAvatar && userDropdown) {
            userAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
        }

        // Navigation - handle both data-page and href attributes
        document.addEventListener('click', (e) => {
            // Handle data-page navigation
            if (e.target.hasAttribute('data-page')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.showPage(page);
            }
            
            // Handle href navigation for internal pages
            if (e.target.tagName === 'A' && e.target.hasAttribute('href')) {
                const href = e.target.getAttribute('href');
                const pageMap = {
                    'index.html': 'home',
                    'dashboard.html': 'dashboard',
                    'circuit-builder.html': 'builder',
                    'my-circuits.html': 'my-circuits'
                };
                
                if (pageMap[href]) {
                    e.preventDefault();
                    this.showPage(pageMap[href]);
                }
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
        document.getElementById('btnAddQubit')?.addEventListener('click', () => {
            this.addQubit();
        });

        document.getElementById('btnRemoveQubit')?.addEventListener('click', () => {
            this.removeQubit();
        });

        // History management
        document.getElementById('btnUndo')?.addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('btnRedo')?.addEventListener('click', () => {
            this.redo();
        });

        document.getElementById('btnClear')?.addEventListener('click', () => {
            this.clearCircuit();
        });

        // Simulation and export
        document.getElementById('btnSimulate')?.addEventListener('click', () => {
            this.simulateCircuit();
        });

        document.getElementById('exportCodeBtn')?.addEventListener('click', () => {
            this.exportCode();
        });

        document.getElementById('saveCircuitBtn')?.addEventListener('click', () => {
            console.log("button not getting clicked");
            
            this.prepareToSaveCircuit();
        });

        console.log("whats happening");
        
        
        // Modal Form Submission: Calls the main save logic
        document.getElementById('saveCircuitForm')?.addEventListener('submit', (e) => {
            console.log("clicked not happenin");
            
            e.preventDefault();
            this.saveCircuit();
        });

        // Language selection
        document.getElementById('codeLangSelect')?.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            localStorage.setItem('qosmos_currentLanguage', e.target.value);
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
    const loginEmail = document.getElementById('loginEmail').value;
    const loginPassword = document.getElementById('loginPassword').value;

    try {
        this.showLoading('Signing in...');
        
        // 1. Authenticate with Firebase
        const userCredential = await this.auth.signInWithEmailAndPassword(loginEmail, loginPassword);
        const user = userCredential.user;
        
        // 2. Retrieve verified and required properties from the user object
        // Use user.email for the verified email
        // Use user.displayName for the name (which might be null/empty, hence the fallback)
        const userPayload = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || 'Quantum User' 
        };

        localStorage.setItem('qosmos_currentUserUid', user.uid);

        // 3. Sync user data with MERN backend (using raw data as required)
        const mernResponse = await fetch('http://localhost:5000/api/user/firebase-login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            // 🛑 CORRECT BODY: Send the collected and verified payload
            body: JSON.stringify(userPayload) 
        });
        
        const mernData = await mernResponse.json();

        if (!mernResponse.ok) {
            // If MERN sync fails, throw error
            await this.auth.signOut(); 
            throw new Error(mernData.message || 'MERN backend sync failed.');
        }
        
        // 4. Update local user state and UI
        this.currentUser = user; 
        // ... (Update other state/stats based on mernData if needed) ...

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

            const user = result.user;                       
            
            // Update user profile
            await result.user.updateProfile({
                displayName: `${firstName} ${lastName}`
            });

            this.hideModal('signupModal');
            this.showToastAsPopup('Account created successfully!', 'success');
            // this.showPage('dashboard');
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
            const user = result.user;
            
            localStorage.setItem('qosmos_currentUserUid', user.uid);
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
        const userMenu = document.getElementById('userMenu');

        if (isLoggedIn) {
            publicNav?.classList.add('hidden');
            privateNav?.classList.remove('hidden');
            userMenu?.classList.remove('hidden');
        } else {
            publicNav?.classList.remove('hidden');
            privateNav?.classList.add('hidden');
            userMenu?.classList.add('hidden');
        }
        
        // Update user profile when navigation changes
        if (isLoggedIn) {
            this.updateUserProfile();
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
        const userId = this.currentUser?.uid; 

        if (!userId) {
            this.userStats = { circuitsCreated: 0, gatesUsed: 0, simulationsRun: 0, codeExports: 0 };
            this.updateStatsDisplay();
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/user/stats/${userId}`);
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch MERN user data.');
            }

            console.log(data.stats);
            
            this.userStats = data.stats;
            this.updateStatsDisplay();

            document.getElementById('dashboardUserName').textContent = data.name.split(' ')[0] || 'User';

        } catch (error) {
            console.error('Error loading user stats from MERN API:', error);
            this.userStats = { circuitsCreated: 0, gatesUsed: 0, simulationsRun: 0, codeExports: 0 };
            this.updateStatsDisplay();
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
    }
    // ==========================================
    // PAGE NAVIGATION
    // ==========================================

    showPage(pageId) {
        // Since we now have separate HTML files, navigate to the appropriate page
        const pageUrls = {
            'home': 'index.html',
            'dashboard': 'dashboard.html',
            'builder': 'circuit-builder.html',
            'my-circuits': 'my-circuits.html'
        };

        const currentPage = window.location.pathname.split('/').pop();
        const targetPage = pageUrls[pageId];

        // Only navigate if we're not already on the target page
        if (targetPage && currentPage !== targetPage) {
            window.location.href = targetPage;
        }

        // Update navigation state for current page
        this.currentPage = pageId;
        this.updateNavigationLinks();

        // Initialize page-specific content for the current page
        this.initializeCurrentPage();
    }

    updateNavigationLinks() {
        // Update active navigation links based on current page
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const linkPage = link.getAttribute('href')?.replace('.html', '') || link.getAttribute('data-page');
            const currentPageFile = window.location.pathname.split('/').pop().replace('.html', '');
            
            if (linkPage === currentPageFile || linkPage === this.currentPage) {
                link.classList.add('active');
            }
        });
    }

    initializeCurrentPage() {
        // Initialize page-specific content based on current page
        const currentPageFile = window.location.pathname.split('/').pop().replace('.html', '');
        
        if (currentPageFile === 'circuit-builder') {
            this.initializeCircuitBuilder();
        } else if (currentPageFile === 'dashboard') {
            this.loadUserStats();
        } else if (currentPageFile === 'my-circuits') {
            this.loadMyCircuits();
        }
    }

    handleDashboardAction(action) {
        switch (action) {
            case 'new-circuit':
                this.showPage('builder');
                localStorage.removeItem('currentCircuitState');
                localStorage.removeItem("qosmos_currentCircuitId")
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
            case 'my-circuits':
                this.showPage('my-circuits');
                break;
        }
    }

    loadMyCircuits() {
        // This method will be called when the my-circuits page loads
        // You can implement loading user circuits here
        console.log('Loading user circuits...');
        
        // Add event listeners for my-circuits page
        this.setupMyCircuitsEvents();
        
        // Load sample circuits (you can replace this with actual data loading)
        this.loadSampleCircuits();
    }

    setupMyCircuitsEvents() {
        // New circuit button
        document.getElementById('newCircuitBtn')?.addEventListener('click', () => {
            this.showPage('builder');
        });

        // Search functionality
        document.getElementById('searchBtn')?.addEventListener('click', () => {
            this.searchCircuits();
        });

        document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchCircuits();
            }
        });

        // Filter and sort functionality
        document.getElementById('sortSelect')?.addEventListener('change', () => {
            this.sortCircuits();
        });

        document.getElementById('filterSelect')?.addEventListener('change', () => {
            this.filterCircuits();
        });

        // Circuit card actions
        document.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                const action = actionBtn.getAttribute('data-action');
                const circuitCard = actionBtn.closest('.circuit-card');
                const circuitId = circuitCard?.getAttribute('data-circuit-id');
                
                this.handleCircuitAction(action, circuitId);
            }
        });

        // Create first circuit button
        document.getElementById('createFirstCircuitBtn')?.addEventListener('click', () => {
            this.showPage('builder');
        });
    }

    loadSampleCircuits() {
        // This is a placeholder - replace with actual circuit loading
        console.log('Sample circuits loaded');
    }

    searchCircuits() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase();
        const circuitCards = document.querySelectorAll('.circuit-card');
        
        circuitCards.forEach(card => {
            const title = card.querySelector('.circuit-title')?.textContent.toLowerCase();
            const description = card.querySelector('.circuit-description')?.textContent.toLowerCase();
            
            if (title?.includes(searchTerm) || description?.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    sortCircuits() {
        const sortBy = document.getElementById('sortSelect')?.value;
        console.log(`Sorting circuits by: ${sortBy}`);
        // Implement sorting logic here
    }

    filterCircuits() {
        const filterBy = document.getElementById('filterSelect')?.value;
        console.log(`Filtering circuits by: ${filterBy}`);
        // Implement filtering logic here
    }

    handleCircuitAction(action, circuitId) {
        switch (action) {
            case 'edit':
                this.editCircuit(circuitId);
                break;
            case 'duplicate':
                this.duplicateCircuit(circuitId);
                break;
            case 'share':
                this.shareCircuit(circuitId);
                break;
            case 'delete':
                this.deleteCircuit(circuitId);
                break;
        }
    }

    editCircuit(circuitId) {
        console.log(`Editing circuit: ${circuitId}`);
        this.showPage('builder');
        // Load the circuit data into the builder
    }

    duplicateCircuit(circuitId) {
        console.log(`Duplicating circuit: ${circuitId}`);
        this.showToastAsPopup('Circuit duplicated', 'success');
    }

    shareCircuit(circuitId) {
        console.log(`Sharing circuit: ${circuitId}`);
        this.showModal('shareCircuitModal');
    }

    deleteCircuit(circuitId) {
        console.log(`Deleting circuit: ${circuitId}`);
        this.showModal('deleteConfirmModal');
    }

    // ==========================================
    // CIRCUIT BUILDER INITIALIZATION
    // ==========================================

    initializeCircuitBuilder() {
        if (this.currentPage !== 'builder') return;

        this.setupCircuitBuilderEvents();
        this.renderGatePalette();
        this.renderCircuitCanvas();
        this.setupDragAndDrop();
        this.updateCircuitInfo();
        this.initializeBlochSphere();
    }

    renderGatePalette() {
        // If a flat `#gatePalette` exists (legacy/enhanced simple palette), use the global builder
        if (document.getElementById('gatePalette')) {
            try { buildGatePalette(); } catch (e) { console.warn('buildGatePalette error', e); }
            return;
        }

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

    /**
     * Sets the currently dragged element and data.
     * This is called by the 'dragstart' event listener in createGateElement.
     */
    handleGateDragStart(e, gate) {
        this.draggedElement = e.target;
        e.dataTransfer.setData('text/plain', gate.type);
        e.dataTransfer.effectAllowed = 'copy';
        e.target.classList.add('dragging');

        // Show valid drop zones
        document.querySelectorAll('.gate-position').forEach(zone => {
            zone.classList.add('gate-drop-target');
        });
    }

    /**
     * Clears the dragged element state.
     * This is called by the 'dragend' event listener in createGateElement.
     */
    handleGateDragEnd(e) {
        this.draggedElement.classList.remove('dragging');
        this.draggedElement = null;

        // Hide drop zone highlights
        document.querySelectorAll('.gate-position').forEach(zone => {
            zone.classList.remove('gate-drop-target');
            zone.classList.remove('gate-drop-hover');
        });
    }

    /**
     * Adds drag-and-drop event listeners to the circuit canvas grid.
     * This is called by initializeCircuitBuilder.
     */
    setupDragAndDrop() {
        const dropZones = document.querySelectorAll('.gate-position');
        this.dropZones = Array.from(dropZones);

        this.dropZones.forEach(zone => {
            // Fired continuously as an element is dragged over the zone
            zone.addEventListener('dragover', (e) => {
                e.preventDefault(); // This is crucial to allow a drop
                e.dataTransfer.dropEffect = 'copy';
                zone.classList.add('gate-drop-hover', 'drop-target');
                
                // Add visual feedback to the qubit line
                const qubitLine = zone.closest('.qubit-line');
                if (qubitLine) {
                    qubitLine.classList.add('drag-active');
                }
            });

            // Fired when a dragged element leaves the zone
            zone.addEventListener('dragleave', (e) => {
                zone.classList.remove('gate-drop-hover', 'drop-target');
                
                // Remove visual feedback from qubit line
                const qubitLine = zone.closest('.qubit-line');
                if (qubitLine) {
                    qubitLine.classList.remove('drag-active');
                }
            });

            // Fired when an element is dropped on the zone
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('gate-drop-hover', 'drop-target');
                
                // Remove visual feedback from qubit line
                const qubitLine = zone.closest('.qubit-line');
                if (qubitLine) {
                    qubitLine.classList.remove('drag-active');
                }
                
                if (this.draggedElement) {
                    // Support multiple attribute names for compatibility
                    const rawQubit = zone.getAttribute('data-qubit') || zone.getAttribute('data-row') || zone.dataset.qubit || zone.dataset.row;
                    const rawDepth = zone.getAttribute('data-depth') || zone.getAttribute('data-column') || zone.getAttribute('data-col') || zone.dataset.depth || zone.dataset.column || zone.dataset.col;
                    const qubit = Number.isFinite(Number(rawQubit)) ? parseInt(rawQubit, 10) : parseInt(rawQubit || '0', 10);
                    const depth = Number.isFinite(Number(rawDepth)) ? parseInt(rawDepth, 10) : parseInt(rawDepth || '0', 10);
                    const gateType = this.draggedElement.getAttribute('data-gate-type') || this.draggedElement.getAttribute('data-gate');
                    
                    // Find the full gate object from the database
                    let gateInfo = null;
                    for (const category in this.quantumGates) {
                        const found = this.quantumGates[category].find(g => g.type === gateType);
                        if (found) {
                            gateInfo = found;
                            break;
                        }
                    }

                    if (gateInfo) {
                        // Call your existing function to add the gate
                        this.addGateToCircuit(gateInfo, qubit, depth);
                    }
                }
            });
        });
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
            qubitLine.style.gridColumn = '1 / -1';

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
                position.style.gridColumn = col + 2; // Column 1 is for qubit labels, gates start at column 2
                // Set multiple attribute names for compatibility with legacy and new handlers
                position.setAttribute('data-qubit', qubit);
                position.setAttribute('data-row', qubit);
                position.setAttribute('data-column', col);
                position.setAttribute('data-depth', col);
                position.setAttribute('data-col', col);

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

        // Also expose the grid on the canvas for external checks
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

        // Setup drop zones for individual positions - delay to ensure elements exist
        setTimeout(() => {
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
        }, 100);
    }

    handleGateDragStart(e, gate) {
        this.draggedElement = { type: 'new-gate', gate: gate };
        e.dataTransfer.effectAllowed = 'copy';
        e.target.classList.add('dragging');
        
        // Add global drag feedback
        document.body.classList.add('dragging-gate');
        const canvas = document.getElementById('circuitCanvas');
        if (canvas) {
            canvas.classList.add('drag-active');
        }
    }

    handleGateDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
        
        // Remove global drag feedback
        document.body.classList.remove('dragging-gate');
        const canvas = document.getElementById('circuitCanvas');
        if (canvas) {
            canvas.classList.remove('drag-active');
        }
        
        // Clean up any remaining drag states
        document.querySelectorAll('.drop-target').forEach(el => {
            el.classList.remove('drop-target');
        });
        document.querySelectorAll('.drag-active').forEach(el => {
            el.classList.remove('drag-active');
        });
    }

    handleGateMoveDragStart(e, gateInfo) {
        this.draggedElement = { type: 'move-gate', gate: gateInfo };
        e.dataTransfer.effectAllowed = 'move';
    }

    handleCanvasDrop(e) {
        // If dropped outside gate positions, only delete when dropped on the visible trash bin
        const trash = document.getElementById('trashBin');
        let droppedOnTrash = false;
        try {
            const el = document.elementFromPoint(e.clientX, e.clientY);
            if (el && (el.id === 'trashBin' || (el.closest && el.closest('#trashBin')))) droppedOnTrash = true;
        } catch (err) {
            // ignore
        }

        if (droppedOnTrash) {
            if (this.draggedElement && this.draggedElement.type === 'move-gate') {
                this.removeGate(this.draggedElement.gate);
                this.showToastAsPopup('Gate removed', 'info');
            }
        } else {
            // Not dropped on trash: cancel the delete/move and re-render to reset any transient drag UI
            this.renderCircuitCanvas();
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
        
        // Add placement animation to the newly placed gate
        setTimeout(() => {
            const gateElement = document.querySelector(`[data-qubit="${qubit}"][data-column="${column}"] .gate-element`);
            if (gateElement) {
                gateElement.classList.add('placed-success');
                setTimeout(() => {
                    gateElement.classList.remove('placed-success');
                }, 500);
            }
        }, 50);
        
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
            const removed = this.circuit.splice(index, 1)[0];
            this.renderCircuitCanvas();
            this.updateCircuitInfo();
            this.generateCode();

            // Store last deleted for undo
            this.lastDeleted = { gate: removed, index: index };

            // Show undo toast (global helper)
            try {
                showUndoToast('Gate removed', () => {
                    if (this.lastDeleted) {
                        // Restore gate at previous index
                        this.circuit.splice(this.lastDeleted.index, 0, this.lastDeleted.gate);
                        this.renderCircuitCanvas();
                        this.updateCircuitInfo();
                        this.generateCode();
                        this.lastDeleted = null;
                        // Show confirmation
                        if (typeof window.showToastAsPopup === 'function') window.showToastAsPopup('Undo successful', 'success');
                    }
                });
            } catch (err) {
                console.error('Failed to show undo toast', err);
            }
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
            this.currentCircuitId = null;
            this.circuitTitle=null;
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

            if (this.currentUser) {
                const userId = this.currentUser.uid;
                
                await fetch(`http://localhost:5000/api/user/stats/increment/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                this.userStats.simulationsRun += 1;
                this.updateStatsDisplay();
            }

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
                    // Purple theme
                    backgroundColor: 'rgba(124, 58, 237, 0.6)',
                    borderColor: 'rgba(124, 58, 237, 1)',
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
            // Purple wireframe sphere
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
    // Use purple accent for the state vector/arrow
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 1)
        ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x8b5cf6 });
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
    }
    // ==========================================
    // CODE GENERATION (MULTI-LANGUAGE)
    // ==========================================

    generateCode() {
        console.log('generateCode called, circuit length:', this.circuit.length);
        console.log('current language:', this.currentLanguage);
        
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

        console.log('Generated code length:', code.length);
        console.log('Generated code preview:', code.substring(0, 100));
        
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

        code += `# Add quantum gates
`;
        sortedGates.forEach(gate => {
            switch (gate.gate) {
                case 'h':
                    code += `qc.h(qr[${gate.qubit}])  # Hadamard gate
`;
                    break;
                case 'x':
                    code += `qc.x(qr[${gate.qubit}])  # Pauli-X gate
`;
                    break;
                case 'y':
                    code += `qc.y(qr[${gate.qubit}])  # Pauli-Y gate
`;
                    break;
                case 'z':
                    code += `qc.z(qr[${gate.qubit}])  # Pauli-Z gate
`;
                    break;
                case 's':
                    code += `qc.s(qr[${gate.qubit}])  # Phase gate
`;
                    break;
                case 't':
                    code += `qc.t(qr[${gate.qubit}])  # T gate
`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || Math.PI / 2;
                    code += `qc.rx(${rxAngle}, qr[${gate.qubit}])  # X-rotation gate
`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || Math.PI / 2;
                    code += `qc.ry(${ryAngle}, qr[${gate.qubit}])  # Y-rotation gate
`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || Math.PI / 2;
                    code += `qc.rz(${rzAngle}, qr[${gate.qubit}])  # Z-rotation gate
`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        code += `qc.cx(qr[${gate.qubit}], qr[${gate.qubit + 1}])  # CNOT gate
`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        code += `qc.cz(qr[${gate.qubit}], qr[${gate.qubit + 1}])  # Controlled-Z gate
`;
                    }
                    break;
                case 'measure':
                    code += `qc.measure(qr[${gate.qubit}], cr[${gate.qubit}])  # Measurement
`;
                    break;
            }
        });

        code += `
# Simulate the circuit
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
                    qasm += `${gate.gate} q[${gate.qubit}];  // ${gate.gate.toUpperCase()} gate on qubit ${gate.qubit}
`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || 'pi/2';
                    qasm += `rx(${rxAngle}) q[${gate.qubit}];  // X-rotation by ${rxAngle}
`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || 'pi/2';
                    qasm += `ry(${ryAngle}) q[${gate.qubit}];  // Y-rotation by ${ryAngle}
`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || 'pi/2';
                    qasm += `rz(${rzAngle}) q[${gate.qubit}];  // Z-rotation by ${rzAngle}
`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        qasm += `cx q[${gate.qubit}],q[${gate.qubit + 1}];  // CNOT from q${gate.qubit} to q${gate.qubit + 1}
`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        qasm += `cz q[${gate.qubit}],q[${gate.qubit + 1}];  // Controlled-Z from q${gate.qubit} to q${gate.qubit + 1}
`;
                    }
                    break;
                case 'measure':
                    qasm += `measure q[${gate.qubit}] -> c[${gate.qubit}];  // Measure qubit ${gate.qubit}
`;
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

        code += `# Add gates to circuit
`;
        sortedGates.forEach(gate => {
            switch (gate.gate) {
                case 'h':
                    code += `circuit.append(cirq.H(qubits[${gate.qubit}]))  # Hadamard
`;
                    break;
                case 'x':
                    code += `circuit.append(cirq.X(qubits[${gate.qubit}]))  # Pauli-X
`;
                    break;
                case 'y':
                    code += `circuit.append(cirq.Y(qubits[${gate.qubit}]))  # Pauli-Y
`;
                    break;
                case 'z':
                    code += `circuit.append(cirq.Z(qubits[${gate.qubit}]))  # Pauli-Z
`;
                    break;
                case 's':
                    code += `circuit.append(cirq.S(qubits[${gate.qubit}]))  # Phase gate
`;
                    break;
                case 't':
                    code += `circuit.append(cirq.T(qubits[${gate.qubit}]))  # T gate
`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || Math.PI / 2;
                    code += `circuit.append(cirq.rx(${rxAngle})(qubits[${gate.qubit}]))  # X-rotation
`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || Math.PI / 2;
                    code += `circuit.append(cirq.ry(${ryAngle})(qubits[${gate.qubit}]))  # Y-rotation
`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || Math.PI / 2;
                    code += `circuit.append(cirq.rz(${rzAngle})(qubits[${gate.qubit}]))  # Z-rotation
`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        code += `circuit.append(cirq.CNOT(qubits[${gate.qubit}], qubits[${gate.qubit + 1}]))  # CNOT
`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        code += `circuit.append(cirq.CZ(qubits[${gate.qubit}], qubits[${gate.qubit + 1}]))  # Controlled-Z
`;
                    }
                    break;
                case 'measure':
                    code += `circuit.append(cirq.measure(qubits[${gate.qubit}], key='m${gate.qubit}'))  # Measurement
`;
                    break;
            }
        });

        code += `
# Simulate the circuit
simulator = cirq.Simulator()
result = simulator.run(circuit, repetitions=1024)

print("Circuit:")
print(circuit)

print("\nSimulation results:")
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
                    code += `            H(qubits[${gate.qubit}]);  // Hadamard gate
`;
                    break;
                case 'x':
                    code += `            X(qubits[${gate.qubit}]);  // Pauli-X gate
`;
                    break;
                case 'y':
                    code += `            Y(qubits[${gate.qubit}]);  // Pauli-Y gate
`;
                    break;
                case 'z':
                    code += `            Z(qubits[${gate.qubit}]);  // Pauli-Z gate
`;
                    break;
                case 's':
                    code += `            S(qubits[${gate.qubit}]);  // Phase gate
`;
                    break;
                case 't':
                    code += `            T(qubits[${gate.qubit}]);  // T gate
`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || 'PI() / 2.0';
                    code += `            Rx(${rxAngle}, qubits[${gate.qubit}]);  // X-rotation
`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || 'PI() / 2.0';
                    code += `            Ry(${ryAngle}, qubits[${gate.qubit}]);  // Y-rotation
`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || 'PI() / 2.0';
                    code += `            Rz(${rzAngle}, qubits[${gate.qubit}]);  // Z-rotation
`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        code += `            CNOT(qubits[${gate.qubit}], qubits[${gate.qubit + 1}]);  // CNOT gate
`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        code += `            Controlled Z([qubits[${gate.qubit}]], qubits[${gate.qubit + 1}]);  // Controlled-Z gate
`;
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

        code += `# Add quantum gates
`;
        sortedGates.forEach(gate => {
            switch (gate.gate) {
                case 'h':
                    code += `circuit.h(${gate.qubit})  # Hadamard gate
`;
                    break;
                case 'x':
                    code += `circuit.x(${gate.qubit})  # Pauli-X gate
`;
                    break;
                case 'y':
                    code += `circuit.y(${gate.qubit})  # Pauli-Y gate
`;
                    break;
                case 'z':
                    code += `circuit.z(${gate.qubit})  # Pauli-Z gate
`;
                    break;
                case 's':
                    code += `circuit.s(${gate.qubit})  # Phase gate
`;
                    break;
                case 't':
                    code += `circuit.t(${gate.qubit})  # T gate
`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || Math.PI / 2;
                    code += `circuit.rx(${gate.qubit}, ${rxAngle})  # X-rotation gate
`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || Math.PI / 2;
                    code += `circuit.ry(${gate.qubit}, ${ryAngle})  # Y-rotation gate
`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || Math.PI / 2;
                    code += `circuit.rz(${gate.qubit}, ${rzAngle})  # Z-rotation gate
`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        code += `circuit.cnot(${gate.qubit}, ${gate.qubit + 1})  # CNOT gate
`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        code += `circuit.cz(${gate.qubit}, ${gate.qubit + 1})  # Controlled-Z gate
`;
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

print("\nMeasurement results:")
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
                    quil += `H ${gate.qubit}\n`;
                    break;
                case 'x':
                    quil += `X ${gate.qubit}\n`;
                    break;
                case 'y':
                    quil += `Y ${gate.qubit}\n`;
                    break;
                case 'z':
                    quil += `Z ${gate.qubit}\n`;
                    break;
                case 's':
                    quil += `S ${gate.qubit}\n`;
                    break;
                case 't':
                    quil += `T ${gate.qubit}\n`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || Math.PI / 2;
                    quil += `RX(${rxAngle}) ${gate.qubit}\n`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || Math.PI / 2;
                    quil += `RY(${ryAngle}) ${gate.qubit}\n`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || Math.PI / 2;
                    quil += `RZ(${rzAngle}) ${gate.qubit}\n`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        quil += `CNOT ${gate.qubit} ${gate.qubit + 1}\n`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        quil += `CZ ${gate.qubit} ${gate.qubit + 1}\n`;
                    }
                    break;
                case 'measure':
                    quil += `MEASURE ${gate.qubit} ro[${gate.qubit}]\n`;
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

        code += `    # Add quantum gates
`;
        sortedGates.forEach(gate => {
            switch (gate.gate) {
                case 'h':
                    code += `    qml.Hadamard(wires=${gate.qubit})  # Hadamard gate
`;
                    break;
                case 'x':
                    code += `    qml.PauliX(wires=${gate.qubit})  # Pauli-X gate
`;
                    break;
                case 'y':
                    code += `    qml.PauliY(wires=${gate.qubit})  # Pauli-Y gate
`;
                    break;
                case 'z':
                    code += `    qml.PauliZ(wires=${gate.qubit})  # Pauli-Z gate
`;
                    break;
                case 's':
                    code += `    qml.S(wires=${gate.qubit})  # Phase gate
`;
                    break;
                case 't':
                    code += `    qml.T(wires=${gate.qubit})  # T gate
`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || Math.PI / 2;
                    code += `    qml.RX(${rxAngle}, wires=${gate.qubit})  # X-rotation gate
`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || Math.PI / 2;
                    code += `    qml.RY(${ryAngle}, wires=${gate.qubit})  # Y-rotation gate
`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || Math.PI / 2;
                    code += `    qml.RZ(${rzAngle}, wires=${gate.qubit})  # Z-rotation gate
`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        code += `    qml.CNOT(wires=[${gate.qubit}, ${gate.qubit + 1}])  # CNOT gate
`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        code += `    qml.CZ(wires=[${gate.qubit}, ${gate.qubit + 1}])  # Controlled-Z gate
`;
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

        code += `    // Add quantum gates
`;
        sortedGates.forEach(gate => {
            switch (gate.gate) {
                case 'h':
                    code += `    circuit->addInstruction(xacc::createInstruction("H", {${gate.qubit}}));  // Hadamard gate
`;
                    break;
                case 'x':
                    code += `    circuit->addInstruction(xacc::createInstruction("X", {${gate.qubit}}));  // Pauli-X gate
`;
                    break;
                case 'y':
                    code += `    circuit->addInstruction(xacc::createInstruction("Y", {${gate.qubit}}));  // Pauli-Y gate
`;
                    break;
                case 'z':
                    code += `    circuit->addInstruction(xacc::createInstruction("Z", {${gate.qubit}}));  // Pauli-Z gate
`;
                    break;
                case 's':
                    code += `    circuit->addInstruction(xacc::createInstruction("S", {${gate.qubit}}));  // Phase gate
`;
                    break;
                case 't':
                    code += `    circuit->addInstruction(xacc::createInstruction("T", {${gate.qubit}}));  // T gate
`;
                    break;
                case 'rx':
                    const rxAngle = gate.params?.angle || Math.PI / 2;
                    code += `    circuit->addInstruction(xacc::createInstruction("Rx", {${gate.qubit}}, {${rxAngle}}));  // X-rotation gate
`;
                    break;
                case 'ry':
                    const ryAngle = gate.params?.angle || Math.PI / 2;
                    code += `    circuit->addInstruction(xacc::createInstruction("Ry", {${gate.qubit}}, {${ryAngle}}));  // Y-rotation gate
`;
                    break;
                case 'rz':
                    const rzAngle = gate.params?.angle || Math.PI / 2;
                    code += `    circuit->addInstruction(xacc::createInstruction("Rz", {${gate.qubit}}, {${rzAngle}}));  // Z-rotation gate
`;
                    break;
                case 'cx':
                    if (gate.qubit < this.qubits - 1) {
                        code += `    circuit->addInstruction(xacc::createInstruction("CNOT", {${gate.qubit}, ${gate.qubit + 1}}));  // CNOT gate
`;
                    }
                    break;
                case 'cz':
                    if (gate.qubit < this.qubits - 1) {
                        code += `    circuit->addInstruction(xacc::createInstruction("CZ", {${gate.qubit}, ${gate.qubit + 1}}));  // Controlled-Z gate
`;
                    }
                    break;
                case 'measure':
                    code += `    circuit->addInstruction(xacc::createInstruction("Measure", {${gate.qubit}}));  // Measurement
`;
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
        console.log('Export button clicked');
        console.log('Circuit length:', this.circuit.length);
        console.log('Current language:', this.currentLanguage);
        
        if (this.circuit.length === 0) {
            this.showToastAsPopup('⚠️ Cannot export: Please add gates to your circuit first', 'warning');
            return;
        }

        this.generateCode();
        const codeEditor = document.getElementById('codeEditor');
        console.log('Code editor element:', codeEditor);
        
        if (!codeEditor) {
            console.error('Code editor element not found');
            return;
        }
        
        const code = codeEditor.textContent;
        console.log('Generated code:', code);
        
        if (!code || code.trim() === '') {
            return;
        }

        const language = this.currentLanguage;
        const extension = this.getFileExtension(language);
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

            this.updateUserStats({ codeExports: 1 });
            this.showToastAsPopup('✅ Circuit exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showToastAsPopup('❌ Export failed: ' + error.message, 'error');
        }
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
        const lines = code.split('\n');
        let column = 0;

        lines.forEach(line => {
            line = line.trim();

            // Parse Qiskit gate calls
            if (line.startsWith('qc.')) {
                const gateMatch = line.match(/qc\.([a-zA-Z]+)\(.*?\[(\d+)\]/);
                if (gateMatch) {
                    const gateType = gateMatch[1];
                    const qubit = parseInt(gateMatch[2]);

                    // Handle parametric gates
                    let params = {};
                    const paramMatch = line.match(/qc\.[a-zA-Z]+\(([^,]+),/);
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
        const lines = code.split('\n');
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
            const singleGateMatch = line.match(/^([hxyzstz])\s+q\[(\d+)\]/);
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
            const rotationMatch = line.match(/^([rR][xyz])\(([^)]+)\)\s+q\[(\d+)\]/);
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
            const twoQubitMatch = line.match(/^(cx|cz)\s+q\[(\d+)\],\s*q\[(\d+)\]/);
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
            const measureMatch = line.match(/^measure\s+q\[(\d+)\]/);
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
        const lines = code.split('\n');
        let column = 0;

        lines.forEach(line => {
            line = line.trim();

            if (line.includes('circuit.append(cirq.')) {
                const gateMatch = line.match(/cirq\.([A-Z]+)\(qubits\[(\d+)\]/);
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
                const rotationMatch = line.match(/cirq\.(r[xyz])\(([^)]+)\)/);
                if (rotationMatch) {
                    const qubitMatch = line.match(/qubits\[(\d+)\]/);
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
        const lines = code.split('\n');
        let column = 0;

        lines.forEach(line => {
            line = line.trim();

            const gateMatch = line.match(/([HXYZSTZ])\(qubits\[(\d+)\]\)/);
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
            const cnotMatch = line.match(/CNOT\(qubits\[(\d+)\],\s*qubits\[(\d+)\]\)/);
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
        const lines = code.split('\n');
        let column = 0;

        lines.forEach(line => {
            line = line.trim();

            // Skip comments
            if (line.startsWith('#') || !line) return;

            // Parse single qubit gates
            const singleGateMatch = line.match(/^([HXYZSTZ])\s+(\d+)/);
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
            const rotationMatch = line.match(/^R([XYZ])\(([^)]+)\)\s+(\d+)/);
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
            const cnotMatch = line.match(/^CNOT\s+(\d+)\s+(\d+)/);
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
        // Purple-centric gate color map to match site theme
        const colorMap = {
            'h': '#7c3aed', // main purple
            'x': '#8b5cf6',
            'y': '#a78bfa',
            'z': '#6d28d9',
            's': '#7c3aed',
            't': '#c4b5fd',
            'rx': '#7c3aed',
            'ry': '#a78bfa',
            'rz': '#6d28d9',
            'cx': '#4c1d95',
            'cz': '#4c1d95',
            'swap': '#7c3aed',
            'measure': '#c7b3f6'
        };

        return colorMap[gateType] || '#4c1d95';
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

        const targetPanel = document.getElementById
        (`${tabName}Tab`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }

    prepareToSaveCircuit() {
        if(this.currentCircuitId) return this.saveCircuit();
        
        console.log(this.currentUser);
        
        if (!this.currentUser || this.circuit.length === 0) {
            if (!this.currentUser) {
                this.showToastAsPopup('🔒 Cannot save: Please log in to save your circuits', 'warning');
            } else {
                this.showToastAsPopup('⚠️ Cannot save: Add gates to your circuit before saving', 'warning');
            }
            return;
        }
        
        // Clear previous input value and show the modal
        document.getElementById('saveTitleInput').value = '';
        this.showModal('saveCircuitModal');
        // Set focus for quick typing
        document.getElementById('saveTitleInput').focus();
    }


    async saveCircuit() {

        console.log("getting called");
        
        console.log("here is the circuit to be saved"+this.currentCircuitId);
        
        const titleInput = document.getElementById('saveTitleInput');
        const title = titleInput ? titleInput.value.trim() : '';

        if (!title && !this.currentCircuitId) {
            this.showToastAsPopup('Please enter a valid title.', 'warning');
            return;
        }

        // Check if user/circuit is valid (already done in prepareToSaveCircuit, but good backup)
        if (!this.currentUser || this.circuit.length === 0) {
             this.hideModal('saveCircuitModal');
             this.showToastAsPopup(this.currentUser ? 'Add gates to circuit before saving.' : 'Please sign in.', 'warning');
             return;
        }

        // Determine if this is a new save (POST) or an update (PUT)
        const isUpdate = this.currentCircuitId !== null;
        const method = isUpdate ? 'PUT' : 'POST';
        const url = isUpdate 
            ? `http://localhost:5000/api/circuits/${this.currentCircuitId}` 
            : 'http://localhost:5000/api/circuits';

        // Hide the modal immediately to show the loading screen underneath
        this.hideModal('saveCircuitModal'); 
        this.showLoading('Saving circuit...');

        try {
            const circuitData = {
                userId: this.currentUser.uid,
                title: title || this.circuitTitle, 
                qubits: this.qubits,
                gates: this.circuit.map(gate => ({
                    type: gate.gate,
                    qubit: gate.qubit,
                    column: gate.column,
                    parameters: gate.params || {}
                })),
                // Include code and language for completeness in the database record
                code: { qiskit: this.generateQiskitCode(), /* ... other languages ... */ },
                language: this.currentLanguage
            };

            // 2. Make POST/PUT request to your Express API
            const response = await fetch(url, { 
                method: method, // Use determined method
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(circuitData)
            });

            const responseData = await response.json();            
            
            if (!response.ok) {
                throw new Error(responseData.message || `Failed to ${isUpdate ? 'update' : 'save'} circuit via API`);
            }
            
            if (!isUpdate) {
                this.currentCircuitId = responseData.circuit._id; 
            }

            this.showToastAsPopup(`Circuit ${isUpdate ? 'updated' : 'saved'} successfully!`, 'success');
            
            if (!isUpdate) {
                this.updateUserStats({ circuitsCreated: 1 });
            }
            

        } catch (error) {
            this.showToastAsPopup('Failed to save circuit: ' + error.message, 'error');
            console.error('API Save Error:', error);
        } finally {
            this.hideLoading();
        }
    }

    async loadRecentCircuits() {

        
        // Ensure user is logged in
        if (!this.currentUser) {
            this.displayRecentCircuits([]); // Show empty state if no user
            return;
        }

        this.showLoading('Loading recent circuits...');

        try {
            // Fetch circuits for the current user from your Express API
            const response = await fetch(`http://localhost:5000/api/circuits/user/${this.currentUser.uid}`);
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch recent circuits.');
            }
            // data will be an array of circuit objects from MongoDB
            this.displayRecentCircuits(data.circuits); 

        } catch (error) {
            this.showToastAsPopup('Failed to load recent circuits: ' + error.message, 'error');
            console.error('API Load Recent Circuits Error:', error);
            this.displayRecentCircuits([]); // Show empty state on error
        } finally {
            this.hideLoading();
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

        container.innerHTML = circuits.map(circuit => {
    const circuitId = circuit._id;
    const dateDisplay = circuit.createdAt ? new Date(circuit.createdAt).toLocaleDateString() : 'N/A';
    
    return `
        <div class="circuit-list-item-wrapper" data-circuit-id="${circuitId}">
            
            <div class="circuit-item-details">
                <div class="detail-title">
                    <h4>${circuit.title}</h4>
                </div>
                
                <div class="detail-stats">
                    ${circuit.qubits} qubits, ${circuit.gates.length} gates
                </div>
                
                <div class="detail-date">
                    Created: ${dateDisplay}
                </div>
            </div>
            
            <div class="circuit-actions">
                <button class="btn btn-ghost" onclick="quantumPlatform.loadCircuit('${circuitId}')">Load</button>
            </div>
        </div>
    `;
}).join('');
    }

    async loadCircuit(circuitId) {

        
        if (!this.currentUser || !circuitId) {
            this.showToastAsPopup('Authentication error or missing circuit ID.', 'error');
            return;
        }

        this.showLoading('Loading circuit...');

        try {
        const response = await fetch(`http://localhost:5000/api/circuits/${circuitId}`);

        const data=await response.json();
        // ... (check response.ok and get data) ...

        // 1. SAVE MERN IDs/PROPS TO LOCAL STORAGE (for persistence)
        localStorage.setItem('qosmos_currentCircuitId', circuitId);
        localStorage.setItem('qosmos_circuitTitle', data.title);
        localStorage.setItem('qosmos_currentLanguage', data.language || 'qiskit');
        
        // 2. SAVE THE CIRCUIT ARRAY to a temporary key for app1.js to read
        // Note: The data.gates array needs to be compatible with SimpleQuantumCircuit.
        const circuitPayload = {
            qubits: data.qubits,
            gates: data.gates.map(gate => ({
                gate: gate.type, 
                qubit: gate.qubit,
                col: gate.column, // Assuming 'col' is the property name used by app1.js/SimpleQuantumCircuit
                params: gate.parameters || {} 
            }))
        };
        localStorage.setItem('qosmos_tempLoadCircuitState', JSON.stringify(circuitPayload));

        // 3. NAVIGATE to the builder page
        this.showPage('builder'); 

        this.showToastAsPopup(`Circuit "${data.title}" loaded successfully!`, 'success');

    } catch (error) {
            this.showToastAsPopup('Failed to load circuit: ' + error.message, 'error');
            console.error('API Load Circuit Error:', error);
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
        // Toast pop-ups disabled globally
        // return;
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
window.quantumPlatform = quantumPlatform;