// ============================================
// Storage Utility Module
// ============================================
const Storage = {
    /**
     * Get item from Local Storage and parse JSON
     */
    getItem: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from Local Storage:', e);
            return null;
        }
    },
    
    /**
     * Set item in Local Storage with JSON serialization
     */
    setItem: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error writing to Local Storage:', e);
            return false;
        }
    },
    
    /**
     * Remove item from Local Storage
     */
    removeItem: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from Local Storage:', e);
            return false;
        }
    }
};

// ============================================
// Utility Functions
// ============================================
const Utils = {
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    },
    
    formatTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};

// ============================================
// Timer Module
// ============================================
const Timer = {
    duration: 25 * 60,
    timeRemaining: 25 * 60,
    intervalId: null,
    isRunning: false,
    
    STORAGE_KEY: 'pomodoro_timer_config',
    
    init: function() {
        const savedTimer = Storage.getItem(this.STORAGE_KEY);
        if (savedTimer) {
            this.duration = savedTimer.duration || 25 * 60;
            this.timeRemaining = savedTimer.timeRemaining || this.duration;
            this.isRunning = savedTimer.isRunning || false;
            if (this.isRunning) this.start();
        }
        UI.updateTimerDisplay(this.timeRemaining);
        UI.updateTimerControls(this.isRunning);
        UI.ensureTimerProminence(this.isRunning);
    },
    
    start: function() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.saveState();
        UI.updateTimerControls(true);
        UI.ensureTimerProminence(true);
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => this.tick(), 1000);
    },
    
    stop: function() {
        if (!this.isRunning) return;
        this.isRunning = false;
        clearInterval(this.intervalId);
        this.saveState();
        UI.updateTimerControls(false);
        UI.ensureTimerProminence(false);
    },
    
    reset: function() {
        this.stop();
        this.timeRemaining = this.duration;
        UI.updateTimerDisplay(this.timeRemaining);
        this.saveState();
    },
    
    tick: function() {
        if (this.timeRemaining <= 0) {
            this.complete();
            return;
        }
        this.timeRemaining--;
        this.saveState();
        UI.updateTimerDisplay(this.timeRemaining);
    },
    
    complete: function() {
        this.stop();
        UI.showCompletionNotification();
    },
    
    updateDuration: function(minutes) {
        const newDuration = Math.max(1, Math.min(120, parseInt(minutes) || 25)) * 60;
        this.duration = newDuration;
        if (!this.isRunning) {
            this.timeRemaining = newDuration;
            UI.updateTimerDisplay(this.timeRemaining);
        }
        this.saveState();
    },
    
    saveState: function() {
        Storage.setItem(this.STORAGE_KEY, {
            duration: this.duration,
            timeRemaining: this.timeRemaining,
            isRunning: this.isRunning
        });
    },
    
    formatTime: function(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
};

// ============================================
// User Settings Module
// ============================================
const UserSettings = {
    name: null,
    STORAGE_KEY: 'pomodoro_user',
    
    init: function() {
        const savedUser = Storage.getItem(this.STORAGE_KEY);
        if (savedUser && savedUser.name) {
            this.name = savedUser.name;
        }
    },
    
    setName: function(name) {
        if (!name || !name.trim()) return false;
        this.name = name.trim();
        Storage.setItem(this.STORAGE_KEY, { name: this.name });
        updateGreeting();
        return true;
    },
    
    getName: function() { return this.name; },
    
    clearName: function() {
        this.name = null;
        Storage.removeItem('pomodoro_user');
        updateGreeting();
        return true;
    }
};

// ============================================
// Theme Manager Module
// ============================================
const ThemeManager = {
    currentTheme: 'light',
    
    themes: {
        light: { '--bg-primary': '#ffffff', '--bg-secondary': '#f5f5f5', '--text-primary': '#333333', '--accent-color': '#4a90d9', '--border-color': '#e0e0e0' },
        dark: { '--bg-primary': '#1a1a2e', '--bg-secondary': '#16213e', '--text-primary': '#eaeaea', '--accent-color': '#5a9de7', '--border-color': '#333333' }
    },
    
    init: function() {
        const savedTheme = Storage.getItem('pomodoro_theme') || 'light';
        this.apply(savedTheme);
    },
    
    toggle: function() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.apply(newTheme);
    },
    
    apply: function(theme) {
        this.currentTheme = theme;
        const root = document.documentElement;
        const colors = this.themes[theme];
        for (const [variable, value] of Object.entries(colors)) {
            root.style.setProperty(variable, value);
        }
        document.documentElement.setAttribute('data-theme', theme);
        Storage.setItem('pomodoro_theme', theme);
    }
};

// ============================================
// Task Manager Module
// ============================================
const TaskManager = {
    tasks: [],
    sortOrder: 'date-desc',
    TASKS_KEY: 'pomodoro_tasks',
    SORT_ORDER_KEY: 'pomodoro_sortOrder',
    
    init: function() {
        const savedTasks = Storage.getItem(this.TASKS_KEY);
        const savedSort = Storage.getItem(this.SORT_ORDER_KEY);
        this.tasks = savedTasks || [];
        this.sortOrder = savedSort || 'date-desc';
        UI.renderTasks();
    },
    
    addTask: function(name) {
        if (!name || name.trim() === '') {
            UI.showError('Task name cannot be empty');
            return false;
        }
        const trimmedName = name.trim();
        if (this.checkDuplicate(trimmedName)) {
            UI.showError('Task already exists');
            return false;
        }
        const newTask = {
            id: Utils.generateId(),
            name: trimmedName,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.tasks.push(newTask);
        this.sortAndPersist();
        UI.renderTasks();
        UI.hideError();
        return true;
    },
    
    editTask: function(id, newName) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return false;
        if (!newName || newName.trim() === '') {
            UI.showError('Task name cannot be empty');
            return false;
        }
        const trimmedNewName = newName.trim();
        const hasDuplicate = this.tasks.some(t => t.id !== id && t.name.toLowerCase() === trimmedNewName.toLowerCase());
        if (hasDuplicate) {
            UI.showError('Task already exists');
            UI.updateTaskEditDisplay(id, trimmedNewName);
            return false;
        }
        task.name = trimmedNewName;
        this.sortAndPersist();
        UI.renderTasks();
        UI.hideError();
        return true;
    },
    
    deleteTask: function(id) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index === -1) return false;
        this.tasks.splice(index, 1);
        this.sortAndPersist();
        UI.renderTasks();
        return true;
    },
    
    toggleComplete: function(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return false;
        task.completed = !task.completed;
        this.sortAndPersist();
        UI.renderTasks();
        return true;
    },
    
    sortTasks: function(criterion) {
        this.sortOrder = criterion;
        this.tasks.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            switch (criterion) {
                case 'date-desc':
                    return dateB - dateA;
                case 'date-asc':
                    return dateA - dateB;
                case 'completed-first':
                    if (a.completed === b.completed) return dateB - dateA;
                    return a.completed ? 1 : -1;
                default:
                    return dateB - dateA;
            }
        });
        Storage.setItem(this.SORT_ORDER_KEY, this.sortOrder);
        UI.renderTasks();
    },
    
    checkDuplicate: function(name, excludeId = null) {
        return this.tasks.some(task => task.name.toLowerCase() === name.toLowerCase() && task.id !== excludeId);
    },
    
    sortAndPersist: function() {
        this.sortTasks(this.sortOrder);
    },
    
    getTasks: function() { return [...this.tasks]; },
    getTaskById: function(id) { return this.tasks.find(t => t.id === id); }
};

// ============================================
// Link Manager Module
// ============================================
const LinkManager = {
    links: [],
    STORAGE_KEY: 'pomodoro_links',
    
    init: function() {
        const savedLinks = Storage.getItem(this.STORAGE_KEY);
        this.links = savedLinks || [];
        UI.renderLinks();
    },
    
    addLink: function(url, label) {
        if (!url || url.trim() === '') {
            UI.showError('URL is required');
            return false;
        }
        try {
            new URL(url);
        } catch (e) {
            UI.showError('Invalid URL format');
            return false;
        }
        const formattedLabel = this.formatLabel(url, label);
        const newLink = {
            id: Utils.generateId(),
            url: url.trim(),
            label: formattedLabel,
            createdAt: new Date().toISOString()
        };
        this.links.push(newLink);
        this.persist();
        UI.renderLinks();
        UI.hideError();
        return true;
    },
    
    deleteLink: function(id) {
        const index = this.links.findIndex(l => l.id === id);
        if (index === -1) return false;
        this.links.splice(index, 1);
        this.persist();
        UI.renderLinks();
        return true;
    },
    
    getLinks: function() { return [...this.links]; },
    
    formatLabel: function(url, label) {
        if (!label || label.trim() === '') {
            try {
                const urlObj = new URL(url);
                let domain = urlObj.hostname;
                if (domain.startsWith('www.')) domain = domain.substring(4);
                return domain;
            } catch (e) {
                return url;
            }
        }
        return label.trim();
    },
    
    persist: function() {
        Storage.setItem(this.STORAGE_KEY, this.links);
    }
};

// ============================================
// UI Controller Module
// ============================================
const UI = {
    elements: {
        timerDisplay: document.getElementById('timer-display'),
        startBtn: document.getElementById('start-btn'),
        stopBtn: document.getElementById('stop-btn'),
        resetBtn: document.getElementById('reset-btn'),
        durationInput: document.getElementById('duration-input'),
        taskList: document.getElementById('task-list'),
        taskInput: document.getElementById('task-input'),
        addTaskBtn: document.getElementById('add-task-btn'),
        sortDateDescBtn: document.getElementById('sort-date-desc-btn'),
        sortDateAscBtn: document.getElementById('sort-date-asc-btn'),
        sortCompletedBtn: document.getElementById('sort-completed-btn'),
        linkList: document.getElementById('link-list'),
        linkUrlInput: document.getElementById('link-url-input'),
        linkLabelInput: document.getElementById('link-label-input'),
        addLinkBtn: document.getElementById('add-link-btn')
    },
    
    init: function() {
        // Theme toggle
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => ThemeManager.toggle());
        }
        
        // Timer controls
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => Timer.start());
        }
        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => Timer.stop());
        }
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => Timer.reset());
        }
        if (this.elements.durationInput) {
            this.elements.durationInput.addEventListener('input', (e) => {
                Timer.updateDuration(e.target.value);
            });
        }
        // Task management
        if (this.elements.addTaskBtn) {
            this.elements.addTaskBtn.addEventListener('click', () => {
                const success = TaskManager.addTask(this.elements.taskInput.value);
                if (success) this.elements.taskInput.value = '';
            });
        }
        if (this.elements.taskInput) {
            this.elements.taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const success = TaskManager.addTask(this.elements.taskInput.value);
                    if (success) this.elements.taskInput.value = '';
                }
            });
        }
        // Sort buttons
        if (this.elements.sortDateDescBtn) {
            this.elements.sortDateDescBtn.addEventListener('click', () => TaskManager.sortTasks('date-desc'));
        }
        if (this.elements.sortDateAscBtn) {
            this.elements.sortDateAscBtn.addEventListener('click', () => TaskManager.sortTasks('date-asc'));
        }
        if (this.elements.sortCompletedBtn) {
            this.elements.sortCompletedBtn.addEventListener('click', () => TaskManager.sortTasks('completed-first'));
        }
        // Link management
        if (this.elements.addLinkBtn) {
            this.elements.addLinkBtn.addEventListener('click', () => {
                const success = LinkManager.addLink(this.elements.linkUrlInput.value, this.elements.linkLabelInput.value);
                if (success) {
                    this.elements.linkUrlInput.value = '';
                    this.elements.linkLabelInput.value = '';
                }
            });
        }
        if (this.elements.linkUrlInput) {
            this.elements.linkUrlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const success = LinkManager.addLink(this.elements.linkUrlInput.value, this.elements.linkLabelInput.value);
                    if (success) {
                        this.elements.linkUrlInput.value = '';
                        this.elements.linkLabelInput.value = '';
                    }
                }
            });
        }
        
        // Save name button
        const saveNameBtn = document.getElementById('save-name-btn');
        if (saveNameBtn) {
            saveNameBtn.addEventListener('click', () => {
                const nameInput = document.getElementById('user-name-input');
                if (nameInput) {
                    const success = UserSettings.setName(nameInput.value);
                    if (success) {
                        nameInput.value = '';
                        updateGreeting();
                    }
                }
            });
        }
        
        // Enter key for name input
        const nameInput = document.getElementById('user-name-input');
        if (nameInput) {
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const success = UserSettings.setName(nameInput.value);
                    if (success) {
                        nameInput.value = '';
                        updateGreeting();
                    }
                }
            });
        }
        
        // Clear name button
        const clearNameBtn = document.getElementById('clear-name-btn');
        if (clearNameBtn) {
            clearNameBtn.addEventListener('click', () => {
                UserSettings.clearName();
                // Clear the input field
                const nameInput = document.getElementById('user-name-input');
                if (nameInput) nameInput.value = '';
                updateGreeting();
            });
        }
        
        this.updateTimerControls(Timer.isRunning);
    },
    
    updateTimerDisplay: function(seconds) {
        const timerDisplay = this.elements.timerDisplay;
        if (timerDisplay && !timerDisplay.classList.contains('timer-completed')) {
            timerDisplay.textContent = Timer.formatTime(seconds);
        }
    },
    
    updateTimerControls: function(isRunning) {
        // Update button states
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = isRunning;
            this.elements.startBtn.setAttribute('aria-label', isRunning ? 'Timer is running' : 'Start the timer');
        }
        if (this.elements.stopBtn) {
            this.elements.stopBtn.disabled = !isRunning;
            this.elements.stopBtn.setAttribute('aria-label', isRunning ? 'Stop the timer' : 'Timer is stopped');
        }
        if (this.elements.resetBtn) {
            this.elements.resetBtn.setAttribute('aria-label', 'Reset the timer');
        }
        if (this.elements.durationInput) {
            this.elements.durationInput.disabled = isRunning;
            this.elements.durationInput.setAttribute('aria-disabled', isRunning ? 'true' : 'false');
        }
    },
    
    ensureTimerProminence: function(isRunning) {
        document.body.setAttribute('data-timer-running', isRunning ? 'true' : 'false');
    },
    
    showCompletionNotification: function() {
        const timerDisplay = this.elements.timerDisplay;
        if (timerDisplay) {
            timerDisplay.textContent = "✅ Time's Up!";
            timerDisplay.classList.add('timer-completed');
            setTimeout(() => {
                timerDisplay.textContent = Timer.formatTime(Timer.timeRemaining);
                timerDisplay.classList.remove('timer-completed');
            }, 3000);
        }
    },
    
    renderTasks: function() {
        const tasks = TaskManager.getTasks();
        if (this.elements.taskList) {
            this.elements.taskList.innerHTML = '';
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.dataset.id = task.id;
                li.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-name">${this.escapeHtml(task.name)}</span>
                    <span class="task-meta">Added: ${Utils.formatDate(task.createdAt)}</span>
                    <button class="task-edit-btn">Edit</button>
                    <button class="task-delete-btn">Delete</button>
                `;
                const checkbox = li.querySelector('.task-checkbox');
                checkbox.addEventListener('change', () => TaskManager.toggleComplete(task.id));
                const editBtn = li.querySelector('.task-edit-btn');
                editBtn.addEventListener('click', () => this.startTaskEdit(li, task.id));
                const deleteBtn = li.querySelector('.task-delete-btn');
                deleteBtn.addEventListener('click', () => TaskManager.deleteTask(task.id));
                this.elements.taskList.appendChild(li);
            });
        }
    },
    
    startTaskEdit: function(li, taskId) {
        const task = TaskManager.getTaskById(taskId);
        if (!task) return;
        const nameSpan = li.querySelector('.task-name');
        const editBtn = li.querySelector('.task-edit-btn');
        const checkbox = li.querySelector('.task-checkbox');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-input-edit';
        input.value = task.name;
        input.maxLength = 200;
        li.insertBefore(input, nameSpan);
        li.removeChild(nameSpan);
        editBtn.textContent = 'Save';
        editBtn.className = 'btn btn-primary';
        checkbox.disabled = true;
        input.focus();
        input.select();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveTaskEdit(li, taskId, input.value, editBtn, checkbox);
        });
        input.addEventListener('blur', () => {
            setTimeout(() => this.saveTaskEdit(li, taskId, input.value, editBtn, checkbox), 200);
        });
    },
    
    saveTaskEdit: function(li, taskId, newName, editBtn, checkbox) {
        const success = TaskManager.editTask(taskId, newName);
        if (success) {
            const input = li.querySelector('.task-input-edit');
            if (input) li.removeChild(input);
            const nameSpan = document.createElement('span');
            nameSpan.className = 'task-name';
            nameSpan.textContent = TaskManager.getTaskById(taskId).name;
            li.insertBefore(nameSpan, editBtn);
            editBtn.textContent = 'Edit';
            editBtn.className = 'btn btn-secondary';
            checkbox.disabled = false;
        } else {
            const input = li.querySelector('.task-input-edit');
            if (input) input.focus();
        }
    },
    
    updateTaskEditDisplay: function(taskId, newName) {
        const li = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (li) {
            const nameSpan = li.querySelector('.task-name');
            if (nameSpan) {
                const input = li.querySelector('.task-input-edit');
                if (input) nameSpan.textContent = newName;
            }
        }
    },
    
    showError: function(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'assertive');
        const taskInput = this.elements.taskInput;
        if (taskInput && taskInput.parentNode) {
            taskInput.parentNode.insertBefore(errorDiv, taskInput.nextSibling);
        }
        setTimeout(() => {
            if (errorDiv.parentNode) errorDiv.remove();
        }, 3000);
    },
    
    hideError: function() {
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
    },
    
    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    renderLinks: function() {
        const links = LinkManager.getLinks();
        if (this.elements.linkList) {
            this.elements.linkList.innerHTML = '';
            links.forEach(link => {
                const li = document.createElement('li');
                li.className = 'link-item';
                li.dataset.id = link.id;
                li.innerHTML = `
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(link.label)}</a>
                    <button class="link-delete-btn">Delete</button>
                `;
                const deleteBtn = li.querySelector('.link-delete-btn');
                deleteBtn.addEventListener('click', () => LinkManager.deleteLink(link.id));
                this.elements.linkList.appendChild(li);
            });
        }
    }
};

// ============================================
// Application Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Pomodoro Timer initialized');
    ThemeManager.init();
    UserSettings.init();
    TaskManager.init();
    LinkManager.init();
    UI.init();
    updateGreeting();
    setInterval(updateDateTime, 60000);
});

function updateGreeting() {
    const hour = new Date().getHours();
    let timeOfDay;
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';
    const name = UserSettings.getName();
    const greetingElement = document.getElementById('greeting-text');
    if (greetingElement) {
        greetingElement.textContent = name ? `Good ${timeOfDay}, ${name}!` : `Good ${timeOfDay}!`;
    }
}

function updateDateTime() {
    const now = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', dateOptions);
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const timeString = now.toLocaleTimeString('en-US', timeOptions);
    const datetimeDisplay = document.getElementById('datetime-display');
    if (datetimeDisplay) {
        datetimeDisplay.textContent = `${dateString} • ${timeString}`;
    }
}
