export function navigate(view) {
  document.getElementById('view-login').classList.toggle('hidden', view !== 'login');
  document.getElementById('view-board').classList.toggle('hidden', view !== 'board');
}
