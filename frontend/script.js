const API = 'http://localhost:3000/tasks';

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const message = document.getElementById('message');

function showMessage(text) {
  message.textContent = text;
}

// GET /tasks - load and display all tasks
async function loadTasks() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Could not load tasks');
    const tasks = await res.json();
    renderTasks(tasks);
    showMessage('');
  } catch (err) {
    showMessage('Cannot reach the server. Is the backend running?');
  }
}

function renderTasks(tasks) {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'No tasks yet.';
    taskList.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement('li');
    // MySQL returns completed as 1 or 0, so convert it to a real boolean
    const isDone = Boolean(task.completed);
    if (isDone) li.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isDone;
    checkbox.addEventListener('change', () => toggleTask(task.id, checkbox.checked));

    const title = document.createElement('span');
    title.textContent = task.title;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'delete-btn';
    delBtn.addEventListener('click', () => deleteTask(task.id));

    li.append(checkbox, title, delBtn);
    taskList.appendChild(li);
  });
}

// POST /tasks - create a task
async function addTask() {
  const title = taskInput.value.trim();
  if (!title) {
    showMessage('Please enter a task title.');
    return;
  }

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Could not add task');
    }
    taskInput.value = '';
    loadTasks();
  } catch (err) {
    showMessage(err.message);
  }
}

// PATCH /tasks/:id - mark complete or incomplete
async function toggleTask(id, completed) {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) throw new Error('Could not update task');
    loadTasks();
  } catch (err) {
    showMessage(err.message);
  }
}

// DELETE /tasks/:id - remove a task
async function deleteTask(id) {
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Could not delete task');
    loadTasks();
  } catch (err) {
    showMessage(err.message);
  }
}

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

loadTasks();