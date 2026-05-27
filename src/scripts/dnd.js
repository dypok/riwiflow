import * as state from './state.js';
import { updateTask } from './api.js';
import { renderBoard } from './board.js';

const STATUS_MAP = {
  'col-todo':        'todo',
  'col-in-progress': 'in-progress',
  'col-in-review':   'in-review',
  'col-done':        'done',
};

let draggedId = null;
let activeCol = null;

function colOf(el) {
  return el?.closest('[id^="col-"]') ?? null;
}

function highlight(col) {
  if (col === activeCol) return;
  activeCol?.classList.remove('drop-target');
  activeCol = col;
  col?.classList.add('drop-target');
}

export function onDragStart(e) {
  const card = e.target.closest('.task-card');
  if (!card) return;
  draggedId = parseInt(card.dataset.id);
  e.dataTransfer.effectAllowed = 'move';
  // setTimeout keeps the drag ghost opaque while fading the original
  setTimeout(() => { card.style.opacity = '0.35'; }, 0);
}

export function onDragEnd(e) {
  const card = e.target.closest?.('.task-card');
  if (card) card.style.opacity = '';
  activeCol?.classList.remove('drop-target');
  activeCol = null;
  draggedId = null;
}

export function onDragOver(e) {
  const col = colOf(e.target);
  if (!col) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  highlight(col);
}

export function onDragLeave(e) {
  const col = colOf(e.target);
  if (!col || col.contains(e.relatedTarget)) return;
  col.classList.remove('drop-target');
  if (activeCol === col) activeCol = null;
}

export async function onDrop(e) {
  const col = colOf(e.target);
  if (!col || draggedId === null) return;
  e.preventDefault();
  col.classList.remove('drop-target');
  activeCol = null;

  const newStatus = STATUS_MAP[col.id];
  const task = state.allTasks.find(t => t.id === draggedId);
  if (!task || task.status === newStatus) return;
  if (state.currentUser.role !== 'admin' && task.userId !== state.currentUser.id) return;

  try {
    const updated = await updateTask(draggedId, { status: newStatus });
    state.setAllTasks(state.allTasks.map(t => t.id === updated.id ? updated : t));
    renderBoard();
  } catch {
    // drop falla silenciosamente; la tarjeta vuelve a su columna original
  }
}
