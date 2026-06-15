// ==========================================================================
// Task Management Application Logic
// ==========================================================================

// Application State
let tasks = [];
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskCategory = document.getElementById('task-category');
const taskPriority = document.getElementById('task-priority');
const taskDate = document.getElementById('task-date');

const tasksContainer = document.getElementById('tasks-container');
const emptyState = document.getElementById('empty-state');
const emptyStateText = document.getElementById('empty-state-text');

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const filterTabs = document.querySelectorAll('.filter-tab');
const sortSelect = document.getElementById('sort-select');

// Stats Elements
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const tasksTodoCount = document.getElementById('tasks-todo-count');
const tasksCompletedCount = document.getElementById('tasks-completed-count');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTaskId = document.getElementById('edit-task-id');
const editTaskInput = document.getElementById('edit-task-input');
const editTaskCategory = document.getElementById('edit-task-category');
const editTaskPriority = document.getElementById('edit-task-priority');
const editTaskDate = document.getElementById('edit-task-date');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Other Controls
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const currentDateEl = document.getElementById('current-date');
const toastContainer = document.getElementById('toast-container');

// Priority Mapping for Sorting
const PRIORITY_WEIGHTS = {
    high: 3,
    medium: 2,
    low: 1
};

// Category Icon Mapping
const CATEGORY_ICONS = {
    Work: '💼',
    Personal: '🏠',
    Shopping: '🛒',
    Health: '❤️',
    Others: '✨'
};

// ==========================================================================
// Initialization & Lifecycle
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 1. Set Date Display
    updateHeaderDate();

    // 2. Load Theme Preference
    initTheme();

    // 3. Set Minimum Date on Input to Today
    const todayStr = new Date().toISOString().split('T')[0];
    taskDate.min = todayStr;
    editTaskDate.min = todayStr;

    // 4. Load Tasks from LocalStorage
    loadTasks();

    // 5. Setup Event Listeners
    setupEventListeners();

    // 6. Initial Render
    renderTasks();
}

function updateHeaderDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    const today = new Date();
    currentDateEl.textContent = today.toLocaleDateString('en-US', options);
}

// ==========================================================================
// Theme Management
// ==========================================================================

function initTheme() {
    const savedTheme = localStorage.getItem('taskify-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('taskify-theme', newTheme);
    updateThemeIcon(newTheme);
    
    showToast(`Switched to ${newTheme} mode!`, 'info');
});

function updateThemeIcon(theme) {
    const icon = themeToggleBtn.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

// ==========================================================================
// Storage Operations
// ==========================================================================

function loadTasks() {
    try {
        const stored = localStorage.getItem('taskify-tasks');
        tasks = stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error parsing stored tasks, resetting list', e);
        tasks = [];
    }
}

function saveTasks() {
    localStorage.setItem('taskify-tasks', JSON.stringify(tasks));
}

// ==========================================================================
// Task CRUD Operations
// ==========================================================================

// Add Task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = taskInput.value.trim();
    const category = taskCategory.value;
    const priority = taskPriority.value;
    const dueDate = taskDate.value;

    if (!title) return;

    const newTask = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        title,
        category,
        priority,
        dueDate,
        completed: false,
        createdAt: Date.now()
    };

    tasks.push(newTask);
    saveTasks();
    
    // Reset Form
    taskForm.reset();
    
    renderTasks();
    showToast('Task added successfully!', 'success');
});

// Toggle Task Completion State
function toggleTaskCompletion(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    task.completed = !task.completed;
    saveTasks();
    
    // Locate the DOM node to trigger completion styles/animations smoothly
    const taskEl = document.getElementById(id);
    if (taskEl) {
        if (task.completed) {
            taskEl.classList.add('completed');
            const checkbox = taskEl.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = true;
            showToast('Task marked as completed!', 'success');
            
            // If all tasks are now completed, trigger confetti!
            checkAndCelebrateCompletion();
        } else {
            taskEl.classList.remove('completed');
            const checkbox = taskEl.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
            showToast('Task marked as active', 'info');
        }
    }
    
    // Update stats without re-rendering the whole DOM (preserves animation state)
    updateStats();
    
    // Slight delay before re-rendering list (to respect filters if looking at Active/Completed tabs)
    if (currentFilter !== 'all') {
        setTimeout(() => {
            renderTasks();
        }, 400);
    }
}

// Delete Task
function deleteTask(id) {
    const taskEl = document.getElementById(id);
    if (taskEl) {
        taskEl.classList.add('fade-out');
        
        // Wait for CSS fade-out animation to complete
        taskEl.addEventListener('animationend', (e) => {
            if (e.animationName === 'taskFadeOut') {
                tasks = tasks.filter(t => t.id !== id);
                saveTasks();
                renderTasks();
                showToast('Task deleted successfully', 'error');
            }
        });
    } else {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        showToast('Task deleted successfully', 'error');
    }
}

// Edit Modal Opening
function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editTaskId.value = task.id;
    editTaskInput.value = task.title;
    editTaskCategory.value = task.category;
    editTaskPriority.value = task.priority;
    editTaskDate.value = task.dueDate || '';

    editModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Lock background scroll
}

function closeEditModal() {
    editModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Unlock scroll
    editForm.reset();
}

// Save Edited Task
editForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = editTaskId.value;
    const title = editTaskInput.value.trim();
    const category = editTaskCategory.value;
    const priority = editTaskPriority.value;
    const dueDate = editTaskDate.value;

    if (!title) return;

    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].title = title;
        tasks[taskIndex].category = category;
        tasks[taskIndex].priority = priority;
        tasks[taskIndex].dueDate = dueDate;

        saveTasks();
        renderTasks();
        closeEditModal();
        showToast('Task updated successfully!', 'success');
    }
});

// ==========================================================================
// Date Formatting Helpers
// ==========================================================================

function formatDueDate(dateStr) {
    if (!dateStr) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const options = { month: 'short', day: 'numeric' };
    if (dueDate.getFullYear() !== today.getFullYear()) {
        options.year = 'numeric';
    }

    const formatted = dueDate.toLocaleDateString('en-US', options);

    let displayStr = formatted;
    let isOverdue = diffDays < 0;

    if (diffDays === 0) {
        displayStr = 'Today';
    } else if (diffDays === 1) {
        displayStr = 'Tomorrow';
    } else if (diffDays === -1) {
        displayStr = 'Yesterday';
    }

    return {
        text: displayStr,
        isOverdue
    };
}

// ==========================================================================
// Filtering, Sorting, and Rendering
// ==========================================================================

function setupEventListeners() {
    // Search Listener
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        if (searchQuery) {
            clearSearchBtn.style.display = 'flex';
        } else {
            clearSearchBtn.style.display = 'none';
        }
        renderTasks();
    });

    // Clear Search Button
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        renderTasks();
        searchInput.focus();
    });

    // Filter Buttons
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-filter');
            renderTasks();
        });
    });

    // Sort Dropdown
    sortSelect.addEventListener('change', () => {
        renderTasks();
    });

    // Close Modal Bindings
    closeModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

function getProcessedTasks() {
    // 1. Filter Tasks
    let result = tasks.filter(task => {
        // Status filter
        if (currentFilter === 'active' && task.completed) return false;
        if (currentFilter === 'completed' && !task.completed) return false;

        // Search filter
        if (searchQuery && !task.title.toLowerCase().includes(searchQuery)) return false;

        return true;
    });

    // 2. Sort Tasks
    const sortBy = sortSelect.value;
    result.sort((a, b) => {
        switch (sortBy) {
            case 'date-created-desc':
                return b.createdAt - a.createdAt;
            case 'date-created-asc':
                return a.createdAt - b.createdAt;
            case 'due-date-asc':
                if (!a.dueDate) return 1;  // Put tasks with no date at the end
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            case 'priority-desc':
                return PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
            default:
                return b.createdAt - a.createdAt;
        }
    });

    return result;
}

function renderTasks() {
    const processed = getProcessedTasks();
    tasksContainer.innerHTML = '';

    // Handle Empty State
    if (processed.length === 0) {
        tasksContainer.style.display = 'none';
        emptyState.style.display = 'flex';
        
        if (searchQuery) {
            emptyStateText.textContent = `We couldn't find any match for "${searchQuery}". Try a different keyword!`;
        } else if (currentFilter === 'active') {
            emptyStateText.textContent = "All caught up! There are no pending tasks left.";
        } else if (currentFilter === 'completed') {
            emptyStateText.textContent = "You haven't completed any tasks yet. Keep moving forward!";
        } else {
            emptyStateText.textContent = "Simplify your day. Add tasks to start organizing your life.";
        }
    } else {
        tasksContainer.style.display = 'flex';
        emptyState.style.display = 'none';

        processed.forEach(task => {
            const taskEl = createTaskDOMNode(task);
            tasksContainer.appendChild(taskEl);
        });
    }

    updateStats();
}

function createTaskDOMNode(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskItem.id = task.id;

    // Custom checkbox HTML
    const checkboxHtml = `
        <label class="checkbox-container">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTaskCompletion('${task.id}')">
            <span class="custom-checkbox">
                <svg viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </span>
        </label>
    `;

    // Category Badge
    const categoryBadge = `
        <span class="badge badge-cat-${task.category.toLowerCase()}">
            ${CATEGORY_ICONS[task.category] || '✨'} ${task.category}
        </span>
    `;

    // Priority Badge
    const priorityText = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    const priorityBadge = `
        <span class="badge badge-priority-${task.priority}">
            ${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} ${priorityText}
        </span>
    `;

    // Due Date Badge
    let dateBadge = '';
    if (task.dueDate) {
        const dateDetails = formatDueDate(task.dueDate);
        if (dateDetails) {
            const overdueClass = (dateDetails.isOverdue && !task.completed) ? 'overdue' : '';
            dateBadge = `
                <span class="badge badge-date ${overdueClass}">
                    <i class="fa-regular fa-calendar-days"></i>
                    <span>${dateDetails.text}</span>
                </span>
            `;
        }
    }

    // Action buttons HTML
    const actionsHtml = `
        <div class="task-actions">
            <button class="action-btn action-btn-edit" onclick="openEditModal('${task.id}')" aria-label="Edit Task">
                <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-btn action-btn-delete" onclick="deleteTask('${task.id}')" aria-label="Delete Task">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `;

    // Combine structure
    taskItem.innerHTML = `
        ${checkboxHtml}
        <div class="task-content">
            <span class="task-title">${escapeHTML(task.title)}</span>
            <div class="task-meta">
                ${priorityBadge}
                ${categoryBadge}
                ${dateBadge}
            </div>
        </div>
        ${actionsHtml}
    `;

    return taskItem;
}

// Safety helper to prevent XSS
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ==========================================================================
// Statistics Engine
// ==========================================================================

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    tasksTodoCount.textContent = pending;
    tasksCompletedCount.textContent = completed;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    progressText.textContent = `${percentage}%`;
    progressBar.style.width = `${percentage}%`;
}

// ==========================================================================
// Celebration Engine (Confetti Canvas Effects)
// ==========================================================================

function checkAndCelebrateCompletion() {
    // Trigger confetti only if all tasks in list are complete and tasks count > 0
    if (tasks.length > 0 && tasks.every(t => t.completed)) {
        triggerConfetti();
        showToast('Incredible! You completed all pending tasks! 🎉', 'success');
    }
}

function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b'];

    // Auto update size if resized during animation
    const resizeHandler = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeHandler);

    // Populate particles
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 5 + 4,
            d: Math.random() * canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0,
            speed: Math.random() * 2.5 + 2
        });
    }

    let animationId;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        particles.forEach((p) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += p.speed;
            p.x += Math.sin(p.tiltAngle) * 0.5;
            p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 5;

            if (p.y < canvas.height) {
                active = true;
            }

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
        });

        if (active) {
            animationId = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resizeHandler);
        }
    }
    draw();
}

// ==========================================================================
// Toast System
// ==========================================================================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-solid fa-circle-check';
    if (type === 'info') iconClass = 'fa-solid fa-circle-info';
    if (type === 'error') iconClass = 'fa-solid fa-circle-exclamation';

    toast.innerHTML = `
        <i class="${iconClass}"></i>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Fade out and remove toast after 3s
    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', (e) => {
            if (e.animationName === 'toastOut') {
                toast.remove();
            }
        });
    }, 3000);
}
