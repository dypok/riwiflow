const _routes = new Map();

export function route(path, handler) {
  _routes.set(path, handler);
}

export function go(path) {
  if (window.location.hash.slice(1) === path) {
    _resolve(path);
  } else {
    window.location.hash = path;
  }
}

function _resolve(path) {
  const handler = _routes.get(path);
  handler ? handler() : go('/login');
}

export function start() {
  window.addEventListener('hashchange', () =>
    _resolve(window.location.hash.slice(1) || '/login')
  );
  _resolve(window.location.hash.slice(1) || '/login');
}

export function showView(view) {
  document.getElementById('view-login').classList.toggle('hidden', view !== 'login');
  document.getElementById('view-board').classList.toggle('hidden', view !== 'board');
}

export function showSubView(subview) {
  const kanban = document.getElementById('kanban-content');
  const users = document.getElementById('users-content');
  const navDashboard = document.getElementById('nav-dashboard');
  const navUsers = document.getElementById('nav-users');

  if (subview === 'board') {
    if (kanban) kanban.classList.remove('hidden');
    if (users) users.classList.add('hidden');
    
    if (navDashboard) {
      navDashboard.className = "flex items-center bg-primary-fixed text-on-primary-fixed-variant rounded-lg mx-2 px-4 py-3 font-body-sm text-body-sm transition-all scale-[0.98]";
    }
    if (navUsers) {
      navUsers.className = "flex items-center text-secondary hover:text-primary hover:bg-primary-container/10 px-4 py-3 mx-2 font-body-sm text-body-sm rounded-lg transition-all";
    }
  } else if (subview === 'users') {
    if (kanban) kanban.classList.add('hidden');
    if (users) users.classList.remove('hidden');
    
    if (navDashboard) {
      navDashboard.className = "flex items-center text-secondary hover:text-primary hover:bg-primary-container/10 px-4 py-3 mx-2 font-body-sm text-body-sm rounded-lg transition-all";
    }
    if (navUsers) {
      navUsers.className = "flex items-center bg-primary-fixed text-on-primary-fixed-variant rounded-lg mx-2 px-4 py-3 font-body-sm text-body-sm transition-all scale-[0.98]";
    }
  }
}

export function openMobileSidebar() {
  const s = document.getElementById('sidebar');
  s.classList.remove('hidden');
  s.classList.add('fixed', 'inset-y-0', 'left-0', 'z-50', 'flex');
  document.getElementById('mobile-overlay').classList.remove('hidden');
}

export function closeMobileSidebar() {
  const s = document.getElementById('sidebar');
  s.classList.add('hidden');
  s.classList.remove('fixed', 'inset-y-0', 'left-0', 'z-50', 'flex');
  document.getElementById('mobile-overlay').classList.add('hidden');
}

