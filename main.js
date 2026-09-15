// Load Tasks, Notes, and Schedule when page opens
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadNotes();
    renderSchedule();
});

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

/* =====================================================
   TO-DO TASKS (with checkbox)
   ===================================================== */

function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();

    if (taskText === '') return;

    const task = { id: Date.now(), text: taskText, completed: false };
    saveTaskToStorage(task);
    renderTask(task);
    input.value = '';
}

function renderTask(task) {
    const list = document.getElementById('todoList');
    const li = document.createElement('li');
    li.className = `todo__item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.onchange = () => toggleTask(task.id, li, checkbox.checked);

    // Text
    const span = document.createElement('span');
    span.textContent = task.text;
    span.onclick = () => {
        checkbox.checked = !checkbox.checked;
        toggleTask(task.id, li, checkbox.checked);
    };

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="ri-delete-bin-line"></i>';
    deleteBtn.onclick = () => deleteTask(task.id, li);

    li.appendChild(checkbox);
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

function toggleTask(id, element, isChecked) {
    const tasks = getTasksFromStorage();
    const updated = tasks.map(t => {
        if (t.id === id) t.completed = isChecked;
        return t;
    });
    localStorage.setItem('karl_portfolio_tasks', JSON.stringify(updated));
    element.classList.toggle('completed', isChecked);
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

/* =====================================================
   NOTES (no checkbox, just reminders)
   ===================================================== */

function addNote() {
    const input = document.getElementById('noteInput');
    const noteText = input.value.trim();

    if (noteText === '') return;

    const note = { id: Date.now(), text: noteText };
    saveNoteToStorage(note);
    renderNote(note);
    input.value = '';
}

function renderNote(note) {
    const list = document.getElementById('noteList');
    const li = document.createElement('li');
    li.className = 'todo__item';
    li.dataset.id = note.id;

    const span = document.createElement('span');
    span.textContent = note.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="ri-delete-bin-line"></i>';
    deleteBtn.onclick = () => deleteNote(note.id, li);

    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
}

function saveNoteToStorage(note) {
    const notes = getNotesFromStorage();
    notes.push(note);
    localStorage.setItem('karl_portfolio_notes', JSON.stringify(notes));
}

function getNotesFromStorage() {
    return JSON.parse(localStorage.getItem('karl_portfolio_notes')) || [];
}

function deleteNote(id, element) {
    let notes = getNotesFromStorage();
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem('karl_portfolio_notes', JSON.stringify(notes));
    element.remove();
}

function loadNotes() {
    const notes = getNotesFromStorage();
    notes.forEach(note => renderNote(note));
}

/* =====================================================
   CUSTOM SCHEDULE
   ===================================================== */

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getClassesFromStorage() {
    return JSON.parse(localStorage.getItem('karl_portfolio_classes')) || [];
}

function saveClassesToStorage(classes) {
    localStorage.setItem('karl_portfolio_classes', JSON.stringify(classes));
}

function formatTime(time24) {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderSchedule() {
    const container = document.getElementById('scheduleContainer');
    container.innerHTML = '';

    const classes = getClassesFromStorage();

    if (classes.length === 0) {
        container.innerHTML = `
            <div class="schedule__empty">
                <i class="ri-calendar-line"></i>
                No classes yet. Click <strong>"Add Class"</strong> to build your schedule.
            </div>`;
        return;
    }

    // Group by day
    const grouped = {};
    DAY_ORDER.forEach(day => { grouped[day] = []; });
    classes.forEach(c => {
        if (!grouped[c.day]) grouped[c.day] = [];
        grouped[c.day].push(c);
    });

    // Sort each day's classes by start time
    DAY_ORDER.forEach(day => {
        grouped[day].sort((a, b) => a.start.localeCompare(b.start));
    });

    // Render each day that has classes
    DAY_ORDER.forEach(day => {
        const dayClasses = grouped[day];
        if (dayClasses.length === 0) return;

        const card = document.createElement('div');
        card.className = 'schedule__card';

        const dayHeader = document.createElement('h3');
        dayHeader.className = 'schedule__day';
        dayHeader.innerHTML = `<i class="ri-calendar-event-line"></i> ${day}`;
        card.appendChild(dayHeader);

        dayClasses.forEach(cls => {
            const item = document.createElement('div');
            item.className = 'subject__item';

            item.innerHTML = `
                <div class="subject__actions">
                    <button class="icon-btn" title="Edit" onclick="openClassModal(${cls.id})">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="icon-btn danger" title="Delete" onclick="deleteClass(${cls.id})">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
                <div class="subject__header">
                    <span class="subject__code">${escapeHtml(cls.code || '—')}</span>
                    <span class="subject__badge">${escapeHtml(cls.type || 'Lec + Lab')}</span>
                </div>
                <p class="subject__name">${escapeHtml(cls.name)}</p>
                <div class="subject__meta">
                    <span><i class="ri-time-line"></i> ${formatTime(cls.start)} - ${formatTime(cls.end)}</span>
                    ${cls.room ? `<span><i class="ri-map-pin-line"></i> ${escapeHtml(cls.room)}</span>` : ''}
                    ${cls.teacher ? `<span><i class="ri-user-3-line"></i> ${escapeHtml(cls.teacher)}</span>` : ''}
                </div>
            `;
            card.appendChild(item);
        });

        container.appendChild(card);
    });
}

/* =====================================================
   MODAL CONTROLS
   ===================================================== */

function openClassModal(id) {
    const modal = document.getElementById('classModal');
    const form = document.getElementById('classForm');
    const title = document.getElementById('modalTitle');

    form.reset();

    if (id) {
        const classes = getClassesFromStorage();
        const cls = classes.find(c => c.id === id);
        if (!cls) return;

        title.textContent = 'Edit Class';
        document.getElementById('classId').value = cls.id;
        document.getElementById('classDay').value = cls.day;
        document.getElementById('classCode').value = cls.code || '';
        document.getElementById('classType').value = cls.type || 'Lec + Lab';
        document.getElementById('className').value = cls.name;
        document.getElementById('classStart').value = cls.start;
        document.getElementById('classEnd').value = cls.end;
        document.getElementById('classRoom').value = cls.room || '';
        document.getElementById('classTeacher').value = cls.teacher || '';
    } else {
        title.textContent = 'Add Class';
        document.getElementById('classId').value = '';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeClassModal() {
    document.getElementById('classModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on outside click
document.getElementById('classModal').addEventListener('click', (e) => {
    if (e.target.id === 'classModal') closeClassModal();
});

// Close modal