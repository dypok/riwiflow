import { init, handleLoginSubmit, loadBoard, logout } from './auth.js';
import { route, go, start, showView, openMobileSidebar, closeMobileSidebar } from './router.js';
import { onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop } from './dnd.js';
import { handleSearch } from './board.js';
import * as state from './state.js';
import {
  openCreateModal, openEditModal, closeModal,
  openDeleteModal, closeDeleteModal,
  handleTaskSubmit, handleEscape, handleOverlayClick, confirmDelete,
} from './modal.js';

// Restaurar sesión antes de que el router resuelva
init();

route('/login', () => {
  if (state.currentUser) { go('/board'); return; }
  showView('login');
});

route('/board', async () => {
  if (!state.currentUser) { go('/login'); return; }
  showView('board');
  await loadBoard();
});

start();

// ── Event listeners ───────────────────────────────────────────────────────────

document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
document.getElementById('btn-menu').addEventListener('click', openMobileSidebar);
document.getElementById('mobile-overlay').addEventListener('click', closeMobileSidebar);
document.getElementById('btn-new-task').addEventListener('click', openCreateModal);
document.getElementById('btn-logout').addEventListener('click', logout);

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  if (btn.dataset.action === 'edit')   openEditModal(id);
  if (btn.dataset.action === 'delete') openDeleteModal(id);
});

document.getElementById('task-form').addEventListener('submit', handleTaskSubmit);
document.getElementById('btn-close-modal').addEventListener('click', closeModal);
document.getElementById('btn-cancel-task').addEventListener('click', closeModal);
document.getElementById('btn-delete-confirm').addEventListener('click', confirmDelete);
document.getElementById('btn-delete-cancel').addEventListener('click', closeDeleteModal);

document.getElementById('task-modal').addEventListener('click', handleOverlayClick(closeModal));
document.getElementById('delete-modal').addEventListener('click', handleOverlayClick(closeDeleteModal));
document.addEventListener('keydown', handleEscape);

document.getElementById('search-input').addEventListener('input', handleSearch);

document.addEventListener('dragstart',  onDragStart);
document.addEventListener('dragend',    onDragEnd);
document.addEventListener('dragover',   onDragOver);
document.addEventListener('dragleave',  onDragLeave);
document.addEventListener('drop',       onDrop);
