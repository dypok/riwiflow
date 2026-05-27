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
