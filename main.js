// Load Tasks when page opens
document.addEventListener('DOMContentLoaded', loadTasks);

// Copy Email Function
function copyEmail() {
    const email = "kenola_240000000030@uic.edu.ph";
    navigator.clipboard.writeText(email);
    
    const emailText = document.getElementById('emailText');
    const originalText = emailText.textContent;
    emailText.textContent = "Copied to Clipboard!";
    
    setTimeout(() => {
        emailText.textContent = originalText;
    }, 2000);
}

// Add Task to LocalStorage
function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();

    if (taskText === '') return;

    const task = { id: Date.now(), text: taskText, completed: false };
    saveTaskToStorage(task);
    renderTask(task);
    input.value = '';
}

// Render Task HTML
function renderTask(task) {
    const list = document.getElementById('todoList');
    const li = document.createElement('li');
    li.className = `todo__item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    const span = document.createElement('span');
    span.textContent = task.text;
    span.onclick = () => toggleTask(task.id, li);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="ri-delete-bin-line"></i>';
    deleteBtn.onclick = () => deleteTask(task.id, li);

    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
}

function saveTaskToStorage(task) {
    const tasks = getTasksFromStorage();
    tasks.push(task);
    localStorage.setItem('karl_portfolio_tasks', JSON.stringify(tasks));
}

function getTasksFromStorage() {
    return JSON.parse(localStorage.getItem('karl_portfolio_tasks')) || [];
}

function toggleTask(id, element) {
    const tasks = getTasksFromStorage();
    const updated = tasks.map(t => {
        if (t.id === id) t.completed = !t.completed;
        return t;
    });
    localStorage.setItem('karl_portfolio_tasks', JSON.stringify(updated));
    element.classList.toggle('completed');
}

function deleteTask(id, element) {
    let tasks = getTasksFromStorage();
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('karl_portfolio_tasks', JSON.stringify(tasks));
    element.remove();
}

function loadTasks() {
    const tasks = getTasksFromStorage();
    tasks.forEach(task => renderTask(task));
}