import { init, handleLoginSubmit, logout } from './auth.js';
import { handleSearch } from './board.js';
import {
  openCreateModal, openEditModal, closeModal,
  openDeleteModal, closeDeleteModal,
  handleTaskSubmit, handleEscape, handleOverlayClick, confirmDelete,
} from './modal.js';

init();

document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
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
