import * as state from './state.js';
import { esc } from './board.js';
import { fetchUsers, createUser, updateUser, deleteUser } from './api.js';

export async function loadUsersView() {
  const isAdmin = state.currentUser.role === 'admin';
  const newBtn = document.getElementById('btn-new-user');
  if (newBtn) newBtn.classList.toggle('hidden', !isAdmin);

  try {
    const users = await fetchUsers();
    state.setAllUsers(users);
    
    // Update local currentUser in case their profile was changed by themselves or someone else
    const updatedSelf = users.find(u => u.id === state.currentUser.id);
    if (updatedSelf) {
      state.setCurrentUser(updatedSelf);
      localStorage.setItem('rw_session', JSON.stringify({ user: updatedSelf }));
    }

    renderUsers();
  } catch (err) {
    alert('Failed to load users from the server.');
  }
}

export function renderUsers() {
  const usersList = document.getElementById('users-list');
  const countUsers = document.getElementById('count-users');
  if (!usersList) return;

  const users = state.allUsers;
  if (countUsers) countUsers.textContent = users.length;

  const isAdmin = state.currentUser.role === 'admin';

  usersList.innerHTML = users.map(user => {
    const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
    const isSelf = user.id === state.currentUser.id;
    const canEdit = isAdmin || isSelf;
    const canDelete = isAdmin && !isSelf;

    return `
      <div class="bg-surface border border-outline-variant rounded-xl p-md shadow-sm flex flex-col justify-between">
        <div class="flex items-center gap-md mb-md min-w-0">
          <div class="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-bold text-lg shrink-0">
            ${initials}
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="font-label-md text-label-md text-on-surface truncate flex items-center gap-sm">
              ${esc(user.name)} 
              ${isSelf ? '<span class="text-xs text-primary font-normal">(You)</span>' : ''}
            </h4>
            <p class="font-body-sm text-body-sm text-on-surface-variant truncate">${esc(user.email)}</p>
            <span class="inline-block mt-xs px-2 py-0.5 rounded-full font-label-sm text-label-sm ${user.role === 'admin' ? 'bg-primary text-on-primary' : 'bg-secondary-container text-secondary'}">
              ${esc(user.role)}
            </span>
          </div>
        </div>
        <div class="flex justify-end gap-sm border-t border-outline-variant pt-sm mt-sm">
          ${canEdit ? `
          <button data-user-action="edit" data-user-id="${user.id}" class="text-primary hover:underline font-label-sm text-label-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">edit</span> Edit
          </button>` : ''}
          ${canDelete ? `
          <button data-user-action="delete" data-user-id="${user.id}" class="text-error hover:underline font-label-sm text-label-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">delete</span> Delete
          </button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

export function openCreateUserModal() {
  document.getElementById('user-modal-title').textContent = 'New User';
  document.getElementById('user-modal-submit').textContent = 'Create User';
  document.getElementById('user-id').value = '';
  document.getElementById('user-name').value = '';
  document.getElementById('user-email').value = '';
  document.getElementById('user-password').value = '';
  document.getElementById('user-role').value = 'coder';
  document.getElementById('user-role').disabled = false;
  document.getElementById('user-modal-error').classList.add('hidden');
  document.getElementById('user-modal').classList.remove('hidden');
}

export function openEditUserModal(userId) {
  const user = state.allUsers.find(u => u.id === userId);
  if (!user) return;

  const isAdmin = state.currentUser.role === 'admin';
  const isSelf = user.id === state.currentUser.id;

  document.getElementById('user-modal-title').textContent = 'Edit User';
  document.getElementById('user-modal-submit').textContent = 'Save Changes';
  document.getElementById('user-id').value = user.id;
  document.getElementById('user-name').value = user.name;
  document.getElementById('user-email').value = user.email;
  document.getElementById('user-password').value = user.password || '';
  document.getElementById('user-role').value = user.role;
  // Non-admins cannot edit roles, and admins cannot edit their own role (to prevent locking themselves out of admin status)
  document.getElementById('user-role').disabled = !isAdmin || isSelf;
  document.getElementById('user-modal-error').classList.add('hidden');
  document.getElementById('user-modal').classList.remove('hidden');
}

export function closeUserModal() {
  document.getElementById('user-modal').classList.add('hidden');
}

export async function handleUserSubmit(e) {
  e.preventDefault();
  const errorEl = document.getElementById('user-modal-error');
  errorEl.classList.add('hidden');

  const id = document.getElementById('user-id').value;
  const name = document.getElementById('user-name').value.trim();
  const email = document.getElementById('user-email').value.trim();
  const password = document.getElementById('user-password').value;
  const role = document.getElementById('user-role').value;

  if (!name || !email || !password) {
    errorEl.textContent = 'All fields are required.';
    errorEl.classList.remove('hidden');
    return;
  }

  // Basic email validation
  if (!/\S+@\S+\.\S+/.test(email)) {
    errorEl.textContent = 'Invalid email address.';
    errorEl.classList.remove('hidden');
    return;
  }

  // Check duplicate email
  const duplicate = state.allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== parseInt(id));
  if (duplicate) {
    errorEl.textContent = 'Email address already in use.';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    if (id) {
      const updated = await updateUser(parseInt(id), { name, email, password, role });
      state.setAllUsers(state.allUsers.map(u => u.id === updated.id ? updated : u));
    } else {
      const created = await createUser({ name, email, password, role });
      state.setAllUsers([...state.allUsers, created]);
    }
    closeUserModal();
    renderUsers();
  } catch (err) {
    errorEl.textContent = 'Failed to save. Check server connection.';
    errorEl.classList.remove('hidden');
  }
}

export function openDeleteUserModal(userId) {
  document.getElementById('delete-user-id').value = userId;
  document.getElementById('delete-user-modal').classList.remove('hidden');
}

export function closeDeleteUserModal() {
  document.getElementById('delete-user-modal').classList.add('hidden');
}

export async function confirmDeleteUser() {
  const id = parseInt(document.getElementById('delete-user-id').value);
  try {
    await deleteUser(id);
    state.setAllUsers(state.allUsers.filter(u => u.id !== id));
    closeDeleteUserModal();
    renderUsers();
  } catch (err) {
    alert('Failed to delete user. Check server connection.');
  }
}

export function initUsersEvents() {
  const btnNewUser = document.getElementById('btn-new-user');
  if (btnNewUser) btnNewUser.addEventListener('click', openCreateUserModal);

  const btnCloseUserModal = document.getElementById('btn-close-user-modal');
  if (btnCloseUserModal) btnCloseUserModal.addEventListener('click', closeUserModal);

  const btnCancelUser = document.getElementById('btn-cancel-user');
  if (btnCancelUser) btnCancelUser.addEventListener('click', closeUserModal);

  const userForm = document.getElementById('user-form');
  if (userForm) userForm.addEventListener('submit', handleUserSubmit);

  const btnDeleteUserConfirm = document.getElementById('btn-delete-user-confirm');
  if (btnDeleteUserConfirm) btnDeleteUserConfirm.addEventListener('click', confirmDeleteUser);

  const btnDeleteUserCancel = document.getElementById('btn-delete-user-cancel');
  if (btnDeleteUserCancel) btnDeleteUserCancel.addEventListener('click', closeDeleteUserModal);

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-user-action]');
    if (!btn) return;
    const id = parseInt(btn.dataset.userId);
    if (btn.dataset.userAction === 'edit') openEditUserModal(id);
    if (btn.dataset.userAction === 'delete') openDeleteUserModal(id);
  });

  document.getElementById('user-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeUserModal();
  });

  document.getElementById('delete-user-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDeleteUserModal();
  });
}
