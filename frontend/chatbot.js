/**
 * Quantum Assistant Chatbot with Grok Cloud API
 * Integrated across all QOSMOS pages
 */

class QuantumChatbot {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.messages = [];
        this.apiKey = null;
        this.apiEndpoint = 'https://api.x.ai/v1/chat/completions';
        this.conversationHistory = [];
        this.maxHistoryLength = 10;
        
        this.init();
    }

    init() {
        this.loadElements();
        this.setupEventListeners();
        this.loadApiKey();
        this.setupQuickActions();
        this.setupAutoResize();
        this.loadConversationHistory();
    }

    loadElements() {
        this.elements = {
            container: document.getElementById('quantumChatbot'),
            toggle: document.getElementById('chatbotToggle'),
            window: document.getElementById('chatbotWindow'),
            messages: document.getElementById('chatbotMessages'),
            input: document.getElementById('chatbotInput'),
            send: document.getElementById('chatbotSend'),
            minimize: document.getElementById('chatbotMinimize'),
            close: document.getElementById('chatbotClose'),
            badge: document.getElementById('chatbotBadge'),
            status: document.getElementById('chatbotStatus'),
            counter: document.getElementById('chatbotCounter'),
            typingIndicator: document.getElementById('typingIndicator'),
            quickActions: document.getElementById('quickActions')
        };
    }

    setupEventListeners() {
        // Toggle chat window
        this.elements.toggle.addEventListener('click', () => this.toggle());
        
        // Close chat window
        this.elements.close.addEventListener('click', () => this.close());
        
        // Minimize chat window
        this.elements.minimize.addEventListener('click', () => this.minimize());
        
        // Send message
        this.elements.send.addEventListener('click', () => this.sendMessage());
        
        // Input events
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.elements.input.addEventListener('input', () => this.updateCounter());
        
        // Quick actions
        this.elements.quickActions.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action')) {
                this.handleQuickAction(e.target.dataset.action);
            }
        });
        
        // Click outside to close (optional)
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.elements.container.contains(e.target)) {
                // Uncomment to enable click-outside-to-close
                // this.close();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    setupQuickActions() {
        const quickActions = {
            'bell-state': 'Explain Bell states and how to create them',
            'hadamard': 'What is a Hadamard gate and what does it do?',
            'superposition': 'Explain quantum superposition with examples',
            'entanglement': 'What is quantum entanglement and why is it important?'
        };
        
        this.quickActions = quickActions;
    }

    setupAutoResize() {
        this.elements.input.addEventListener('input', () => {
            this.elements.input.style.height = 'auto';
            this.elements.input.style.height = Math.min(this.elements.input.scrollHeight, 120) + 'px';
        });
    }

    loadApiKey() {
        // Try to load API key from localStorage or environment
        this.apiKey = localStorage.getItem('grokApiKey') || 
                     'xai-8Qj0PQbVNzfEclxPeJqfLJPFQf4jEVKNT9G9VgG8jYQr9K58Spj8Qf2LQ3Rvn3kpNf6L8JQ7'; // Demo key
        
        if (!this.apiKey) {
            console.warn('Grok API key not found. Chatbot will use mock responses.');
        }
    }

    loadConversationHistory() {
        const saved = localStorage.getItem('quantumChatHistory');
        if (saved) {
            try {
                this.conversationHistory = JSON.parse(saved);
                this.renderMessages();
            } catch (e) {
                console.error('Failed to load conversation history:', e);
            }
        }
    }

    saveConversationHistory() {
        try {
            localStorage.setItem('quantumChatHistory', JSON.stringify(this.conversationHistory));
        } catch (e) {
            console.error('Failed to save conversation history:', e);
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.elements.window.classList.remove('hidden');
        this.elements.toggle.classList.add('hidden');
        this.elements.badge.classList.add('hidden');
        
        // Focus input when opening
        setTimeout(() => {
            this.elements.input.focus();
        }, 300);
        
        // Clear unread badge
        localStorage.setItem('chatbotUnread', '0');
    }

    close() {
        this.isOpen = false;
        this.elements.window.classList.add('hidden');
        this.elements.toggle.classList.remove('hidden');
        this.isMinimized = false;
    }

    minimize() {
        this.isMinimized = !this.isMinimized;
        if (this.isMinimized) {
            this.elements.window.style.transform = 'translateY(calc(100% - 60px))';
            this.elements.minimize.textContent = '+';
        } else {
            this.elements.window.style.transform = 'translateY(0)';
            this.elements.minimize.textContent = '−';
        }
    }

    async sendMessage() {
        const message = this.elements.input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.elements.input.value = '';
        this.updateCounter();
        this.elements.input.style.height = 'auto';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            this.addMessage(response, 'bot');
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTypingIndicator();
            this.addMessage(
                "I'm sorry, I encountered an error. Please try again or check your internet connection.",
                'bot'
            );
        }
    }

    addMessage(content, sender) {
        const message = {
            content,
            sender,
            timestamp: new Date()
        };
        
        this.conversationHistory.push(message);
        
        // Keep only recent messages
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }
        
        this.renderMessage(message);
        this.saveConversationHistory();
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}-message`;
        
        const avatar = message.sender === 'user' ? '👤' : '⚛️';
        const time = this.formatTime(message.timestamp);
        
        messageElement.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <p>${this.escapeHtml(message.content)}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
        
        this.elements.messages.appendChild(messageElement);
    }

    renderMessages() {
        this.elements.messages.innerHTML = '';
        this.conversationHistory.forEach(message => {
            this.renderMessage(message);
        });
        this.scrollToBottom();
    }

    formatTime(date) {
        // If date is not a Date object, convert it
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }, 100);
    }

    updateCounter() {
        const length = this.elements.input.value.length;
        this.elements.counter.textContent = `${length}/500`;
        
        // Change color when approaching limit
        if (length > 450) {
            this.elements.counter.style.color = 'var(--danger)';
        } else if (length > 400) {
            this.elements.counter.style.color = 'var(--warning)';
        } else {
            this.elements.counter.style.color = 'var(--text-secondary)';
        }
    }

    showTypingIndicator() {
        this.elements.typingIndicator.classList.remove('hidden');
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.elements.typingIndicator.classList.add('hidden');
    }

    handleQuickAction(action) {
        const query = this.quickActions[action];
        if (query) {
            this.elements.input.value = query;
            this.sendMessage();
        }
    }

    async getAIResponse(message) {
        // If no API key, use mock responses for demo
        if (!this.apiKey || this.apiKey.includes('demo')) {
            return this.getMockResponse(message);
        }
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: `You are a helpful quantum computing assistant. Answer questions about quantum circuits, gates, algorithms, and quantum mechanics. Be concise but informative. If asked about specific quantum concepts, provide clear explanations with examples where appropriate.`
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    model: 'grok-beta',
                    stream: false,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('Grok API Error:', error);
            // Fallback to mock response if API fails
            return this.getMockResponse(message);
        }
    }

    getMockResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Quantum-specific responses
        if (lowerMessage.includes('hadamard') || lowerMessage.includes('h gate')) {
            return `The Hadamard gate (H) is a fundamental single-qubit gate that creates superposition. It maps |0⟩ to (|0⟩+|1⟩)/√2 and |1⟩ to (|0⟩-|1⟩)/√2. Essentially, it puts a qubit into an equal superposition of 0 and 1 states. It's crucial for creating quantum parallelism and is used in algorithms like Deutsch-Jozsa and Grover's search.`;
        }
        
        if (lowerMessage.includes('bell') || lowerMessage.includes('entanglement')) {
            return `Bell states are maximally entangled two-qubit states. There are four Bell states:
            
1. |Φ+⟩ = (|00⟩+|11⟩)/√2
2. |Φ-⟩ = (|00⟩-|11⟩)/√2  
3. |Ψ+⟩ = (|01⟩+|10⟩)/√2
4. |Ψ-⟩ = (|01⟩-|10⟩)/√2

You can create Bell states using a Hadamard gate on the first qubit followed by a CNOT gate.`;
        }
        
        if (lowerMessage.includes('superposition')) {
            return `Quantum superposition is the principle that a quantum system can exist in multiple states simultaneously until measured. For example, a qubit can be in state |ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1. When measured, it collapses to either |0⟩ with probability |α|² or |1⟩ with probability |β|².`;
        }
        
        if (lowerMessage.includes('cnot') || lowerMessage.includes('controlled')) {
            return `The CNOT (Controlled-NOT) gate is a two-qubit gate where the second qubit (target) is flipped if the first qubit (control) is |1⟩. It's represented by the matrix:
            
CNOT = |0⟩⟨0| ⊗ I + |1⟩⟨1| ⊗ X

Truth table:
|00⟩ → |00⟩
|01⟩ → |01⟩  
|10⟩ → |11⟩
|11⟩ → |10⟩

It's essential for creating entanglement and quantum algorithms.`;
        }
        
        if (lowerMessage.includes('measure') || lowerMessage.includes('measurement')) {
            return `Quantum measurement collapses the quantum state to a classical outcome. When you measure a qubit in state |ψ⟩ = α|0⟩ + β|1⟩, you get:

• 0 with probability |α|²
• 1 with probability |β|²

After measurement, the qubit state collapses to the measured value. Measurement is irreversible and destroys superposition.`;
        }
        
        if (lowerMessage.includes('algorithm') || lowerMessage.includes('deutsch')) {
            return `Some famous quantum algorithms include:

• Deutsch-Jozsa: Determines if a function is constant or balanced in one query
• Grover's: Searches unsorted databases with quadratic speedup
• Shor's: Factors large integers exponentially faster
• Quantum Fourier Transform: Foundation for many algorithms

Each leverages quantum properties like superposition and entanglement for computational advantages.`;
        }
        
        // General quantum computing response
        if (lowerMessage.includes('quantum') || lowerMessage.includes('qubit')) {
            return `Quantum computing uses quantum bits (qubits) that can exist in superposition of both 0 and 1 states simultaneously, unlike classical bits. Key principles include:

• Superposition: Qubits can be in multiple states at once
• Entanglement: Qubits can be correlated in ways that classical systems cannot
• Interference: Quantum amplitudes can add or cancel out
• Measurement: Observing a quantum state collapses it

These properties enable quantum algorithms that can solve certain problems much faster than classical computers.`;
        }
        
        // Default response
        return `I'm your Quantum Assistant! I can help you with quantum computing concepts, circuit building, gates, algorithms, and more. Try asking me about:

• Hadamard gates and superposition
• CNOT gates and entanglement  
• Bell states
• Quantum measurement
• Quantum algorithms like Deutsch-Jozsa or Grover's
• Building quantum circuits

What would you like to know about quantum computing?`;
    }

    // Public API methods
    show() {
        this.elements.toggle.classList.remove('hidden');
    }

    hide() {
        this.close();
        this.elements.toggle.classList.add('hidden');
    }

    addNotification(message) {
        // Show badge with notification
        this.elements.badge.classList.remove('hidden');
        this.elements.badge.textContent = '!';
        
        // Store unread count
        const unread = parseInt(localStorage.getItem('chatbotUnread') || '0') + 1;
        localStorage.setItem('chatbotUnread', unread.toString());
        
        // Add notification message
        this.addMessage(message, 'bot');
    }

    clearHistory() {
        this.conversationHistory = [];
        this.elements.messages.innerHTML = '';
        this.saveConversationHistory();
        
        // Add welcome message
        this.addMessage(
            "Conversation history cleared. How can I help you with quantum computing today?",
            'bot'
        );
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quantumChatbot = new QuantumChatbot();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuantumChatbot;
}