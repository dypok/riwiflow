import * as state from './state.js';
import { loginUser, fetchUsers, fetchTasks } from './api.js';
import { navigate } from './router.js';
import { renderBoard } from './board.js';

export function init() {
  const sessionRaw = localStorage.getItem('rw_session');
  if (sessionRaw) {
    state.setCurrentUser(JSON.parse(sessionRaw).user);
    navigate('board');
    loadBoard();
  } else {
    navigate('login');
  }
}

export async function handleLoginSubmit(e) {
  e.preventDefault();
  const errorEl = document.getElementById('login-error');
  errorEl.classList.add('hidden');
  try {
    await login(
      document.getElementById('email').value.trim(),
      document.getElementById('password').value,
    );
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
}

export async function login(email, password) {
  let users;
  try {
    users = await loginUser(email, password);
  } catch {
    throw new Error('Cannot connect to the server. Run: npm run dev');
  }

  if (users.length === 0) throw new Error('Invalid email or password.');

  state.setCurrentUser(users[0]);
  localStorage.setItem('rw_session', JSON.stringify({ user: state.currentUser }));
  navigate('board');
  await loadBoard();
}

export async function loadBoard() {
  const isAdmin = state.currentUser.role === 'admin';
  document.getElementById('btn-new-task').classList.toggle('hidden', !isAdmin);
  document.getElementById('assignee-field').classList.toggle('hidden', !isAdmin);

  try {
    const [users, tasks] = await Promise.all([fetchUsers(), fetchTasks()]);
    state.setAllUsers(users);
    state.setAllTasks(tasks);
    renderBoard();
  } catch {
    alert('Cannot connect to json-server. Run: npm run dev');
  }
}

export function logout() {
  localStorage.removeItem('rw_session');
  state.setCurrentUser(null);
  state.setAllUsers([]);
  state.setAllTasks([]);
  state.setSearchQuery('');
  document.getElementById('email').value    = '';
  document.getElementById('password').value = '';
  navigate('login');
}
