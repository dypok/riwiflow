import * as state from './state.js';
import { esc, renderBoard } from './board.js';
import { createTask, updateTask, deleteTask } from './api.js';

export function openCreateModal() {
  document.getElementById('modal-title').textContent  = 'New Task';
  document.getElementById('modal-submit').textContent = 'Create Task';
  document.getElementById('task-id').value            = '';
  document.getElementById('task-title').value         = '';
  document.getElementById('task-title').disabled      = false;
  document.getElementById('task-desc').value          = '';
  document.getElementById('task-status').value        = 'todo';
  document.getElementById('modal-error').classList.add('hidden');
  populateUserSelect(state.currentUser.id);
  document.getElementById('task-modal').classList.remove('hidden');
}

export function openEditModal(taskId) {
  const task = state.allTasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById('modal-title').textContent  = 'Edit Task';
  document.getElementById('modal-submit').textContent = 'Save Changes';
  document.getElementById('task-id').value            = task.id;
  document.getElementById('task-title').value         = task.title;
  document.getElementById('task-title').disabled      = state.currentUser.role !== 'admin';
  document.getElementById('task-desc').value          = task.description;
  document.getElementById('task-status').value        = task.status;
  document.getElementById('modal-error').classList.add('hidden');
  populateUserSelect(task.userId);
  document.getElementById('task-modal').classList.remove('hidden');
}

export function closeModal() {
  document.getElementById('task-modal').classList.add('hidden');
  document.getElementById('task-title').disabled = false;
}

export function populateUserSelect(selectedId) {
  document.getElementById('task-user').innerHTML = state.allUsers.map(u =>
    `<option value="${u.id}" ${u.id === selectedId ? 'selected' : ''}>${esc(u.name)} (${u.role})</option>`
  ).join('');
}

export function showModalError(msg) {
  const el = document.getElementById('modal-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

export async function saveTask() {
  document.getElementById('modal-error').classList.add('hidden');

  const id     = document.getElementById('task-id').value;
  const title  = document.getElementById('task-title').value.trim();
  const desc   = document.getElementById('task-desc').value.trim();
  const status = document.getElementById('task-status').value;
  const userId = state.currentUser.role === 'admin'
    ? parseInt(document.getElementById('task-user').value)
    : state.currentUser.id;

  if (!title) { showModalError('Title is required.'); return; }

  try {
    if (id) {
      const task = state.allTasks.find(t => t.id === parseInt(id));
      if (state.currentUser.role !== 'admin' && task.userId !== state.currentUser.id) {
        showModalError('You can only edit your own tasks.');
        return;
      }
      const body = state.currentUser.role === 'admin'
        ? { title, description: desc, status, userId }
        : { description: desc, status };

      const updated = await updateTask(id, body);
      state.setAllTasks(state.allTasks.map(t => t.id === updated.id ? updated : t));
    } else {
      const created = await createTask({ title, description: desc, status, userId });
      state.setAllTasks([...state.allTasks, created]);
    }
    closeModal();
    renderBoard();
  } catch {
    showModalError('Failed to save. Check server connection.');
  }
}

export function openDeleteModal(taskId) {
  document.getElementById('delete-task-id').value = taskId;
  document.getElementById('delete-modal').classList.remove('hidden');
}

export function closeDeleteModal() {
  document.getElementById('delete-modal').classList.add('hidden');
}

export async function handleTaskSubmit(e) {
  e.preventDefault();
  await saveTask();
}

export function handleEscape(e) {
  if (e.key === 'Escape') { closeModal(); closeDeleteModal(); }
}

export function handleOverlayClick(closeFn) {
  return e => { if (e.target === e.currentTarget) closeFn(); };
}

export async function confirmDelete() {
  const id = parseInt(document.getElementById('delete-task-id').value);
  try {
    await deleteTask(id);
    state.setAllTasks(state.allTasks.filter(t => t.id !== id));
    closeDeleteModal();
    renderBoard();
  } catch {
    alert('Failed to delete.');
  }
}
