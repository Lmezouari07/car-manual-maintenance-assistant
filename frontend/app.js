// API Configuration
const API_URL = 'http://localhost:8000';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const uploadStatus = document.getElementById('uploadStatus');
const manualsList = document.getElementById('manualsList');
const currentManual = document.getElementById('currentManual');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const questionInput = document.getElementById('questionInput');
const sendBtn = document.getElementById('sendBtn');
const clearChat = document.getElementById('clearChat');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// State
let selectedManual = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadManuals();
    setupEventListeners();
    checkHealth();
});

// Setup Event Listeners
function setupEventListeners() {
    // File upload
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            uploadFile(file);
        } else {
            showToast('Please upload a PDF file', 'error');
        }
    });
    
    // Chat form
    chatForm.addEventListener('submit', handleSubmit);
    
    // Text input
    questionInput.addEventListener('input', () => {
        sendBtn.disabled = !questionInput.value.trim();
        autoResize(questionInput);
    });
    
    questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (questionInput.value.trim()) {
                handleSubmit(e);
            }
        }
    });
    
    // Clear chat
    clearChat.addEventListener('click', () => {
        chatMessages.innerHTML = getWelcomeMessage();
    });
}

// Check API Health
async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        if (!data.api_key_configured) {
            showToast('OpenAI API key not configured', 'error');
        }
    } catch (error) {
        showToast('Cannot connect to server', 'error');
    }
}

// Load Manuals
async function loadManuals() {
    try {
        const response = await fetch(`${API_URL}/manuals`);
        const data = await response.json();
        renderManuals(data.manuals);
    } catch (error) {
        console.error('Error loading manuals:', error);
    }
}

// Render Manuals List
function renderManuals(manuals) {
    if (manuals.length === 0) {
        manualsList.innerHTML = '<li class="no-manuals">No manuals uploaded yet</li>';
        return;
    }
    
    manualsList.innerHTML = manuals.map(manual => `
        <li class="manual-item ${selectedManual === manual ? 'active' : ''}" data-name="${manual}">
            <div class="manual-info" onclick="selectManual('${manual}')">
                <i class="fas fa-file-pdf"></i>
                <span class="manual-name">${manual}</span>
            </div>
            <button class="delete-btn" onclick="deleteManual('${manual}', event)">
                <i class="fas fa-trash"></i>
            </button>
        </li>
    `).join('');
}

// Select Manual
function selectManual(name) {
    selectedManual = name;
    currentManual.textContent = `Manual: ${name}`;
    document.querySelectorAll('.manual-item').forEach(item => {
        item.classList.toggle('active', item.dataset.name === name);
    });
}

// Delete Manual
async function deleteManual(name, event) {
    event.stopPropagation();
    
    if (!confirm(`Delete "${name}"?`)) return;
    
    try {
        const response = await fetch(`${API_URL}/manuals/${name}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Manual deleted', 'success');
            if (selectedManual === name) {
                selectedManual = null;
                currentManual.textContent = 'No manual selected';
            }
            loadManuals();
        } else {
            throw new Error('Delete failed');
        }
    } catch (error) {
        showToast('Error deleting manual', 'error');
    }
}

// Handle File Select
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        uploadFile(file);
    }
}

// Upload File
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    uploadProgress.classList.add('active');
    progressFill.style.width = '0%';
    uploadStatus.textContent = 'Uploading...';
    
    try {
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 90) {
                progressFill.style.width = `${progress}%`;
            }
        }, 200);
        
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        
        if (response.ok) {
            progressFill.style.width = '100%';
            uploadStatus.textContent = 'Upload complete!';
            showToast('Manual uploaded successfully', 'success');
            
            const data = await response.json();
            selectManual(data.filename);
            loadManuals();
            
            setTimeout(() => {
                uploadProgress.classList.remove('active');
            }, 2000);
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }
    } catch (error) {
        progressFill.style.width = '0%';
        uploadStatus.textContent = 'Upload failed';
        showToast(error.message, 'error');
        
        setTimeout(() => {
            uploadProgress.classList.remove('active');
        }, 2000);
    }
    
    fileInput.value = '';
}

// Handle Chat Submit
async function handleSubmit(e) {
    e.preventDefault();
    
    const question = questionInput.value.trim();
    if (!question) return;
    
    // Hide welcome message
    const welcomeMsg = chatMessages.querySelector('.welcome-message');
    if (welcomeMsg) welcomeMsg.remove();
    
    // Add user message
    addMessage(question, 'user');
    questionInput.value = '';
    sendBtn.disabled = true;
    autoResize(questionInput);
    
    // Add typing indicator
    const typingId = addTypingIndicator();
    
    try {
        const response = await fetch(`${API_URL}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: question,
                manual_name: selectedManual
            })
        });
        
        removeTypingIndicator(typingId);
        
        if (response.ok) {
            const data = await response.json();
            addMessage(data.answer, 'assistant', data.source);
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get response');
        }
    } catch (error) {
        removeTypingIndicator(typingId);
        addMessage(`Error: ${error.message}`, 'assistant');
        showToast(error.message, 'error');
    }
}

// Add Message to Chat
function addMessage(content, role, source = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const icon = role === 'user' ? 'fa-user' : 'fa-robot';
    const formattedContent = formatMessage(content);
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${icon}"></i>
        </div>
        <div class="message-content">
            ${formattedContent}
            ${source ? `<div class="message-source">Source: ${source}</div>` : ''}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Format Message (handle markdown-like formatting)
function formatMessage(content) {
    // Convert line breaks to paragraphs
    const paragraphs = content.split('\n\n');
    return paragraphs.map(p => {
        // Handle single line breaks within paragraphs
        const lines = p.split('\n').join('<br>');
        return `<p>${lines}</p>`;
    }).join('');
}

// Add Typing Indicator
function addTypingIndicator() {
    const id = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = id;
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

// Remove Typing Indicator
function removeTypingIndicator(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

// Ask Example Question
function askExample(question) {
    questionInput.value = question;
    sendBtn.disabled = false;
    questionInput.focus();
}

// Auto Resize Textarea
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
}

// Show Toast
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.querySelector('i').className = type === 'success' 
        ? 'fas fa-check-circle' 
        : 'fas fa-exclamation-circle';
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Get Welcome Message HTML
function getWelcomeMessage() {
    return `
        <div class="welcome-message">
            <div class="welcome-icon">
                <i class="fas fa-car-side"></i>
            </div>
            <h2>Welcome to Car Manual Assistant</h2>
            <p>Upload your car manual and ask any questions about maintenance, features, or troubleshooting.</p>
            <div class="example-questions">
                <h4>Try asking:</h4>
                <button class="example-btn" onclick="askExample('How do I change the oil?')">
                    <i class="fas fa-oil-can"></i> How do I change the oil?
                </button>
                <button class="example-btn" onclick="askExample('What does the check engine light mean?')">
                    <i class="fas fa-engine-warning"></i> What does the check engine light mean?
                </button>
                <button class="example-btn" onclick="askExample('What is the recommended tire pressure?')">
                    <i class="fas fa-tire"></i> What is the recommended tire pressure?
                </button>
            </div>
        </div>
    `;
}
