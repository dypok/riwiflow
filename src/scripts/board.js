import * as state from './state.js';
import { setSearchQuery } from './state.js';


export const COLUMNS = ['todo', 'in-progress', 'in-review', 'done'];

export function esc(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str || ''));
  return d.innerHTML;
}

export function renderCard(task) {
  const assignee = state.allUsers.find(u => u.id === task.userId);
  const canEdit  = state.currentUser.role === 'admin' || task.userId === state.currentUser.id;
  const isAdmin  = state.currentUser.role === 'admin';
  const isDone   = task.status === 'done';
  const inProg   = task.status === 'in-progress';

  return `
    <div class="task-card bg-surface ${isDone ? 'opacity-80' : ''} ${inProg ? 'border-l-4 border-l-primary' : ''} border border-outline-variant rounded-xl p-md shadow-sm">
      <div class="flex items-start justify-between mb-xs">
        <span class="${isDone ? 'bg-secondary-container text-secondary' : 'bg-primary-fixed text-on-primary-fixed-variant'} px-2 py-0.5 rounded-full font-label-sm text-label-sm">
          ${esc(assignee ? assignee.name : 'Unassigned')}
        </span>
        ${isDone ? `<span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1;color:#8f4200">check_circle</span>` : ''}
        ${inProg ? `<span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings:'FILL' 1">star</span>` : ''}
      </div>
      <h4 class="font-label-md text-label-md text-on-surface mb-xs ${isDone ? 'line-through' : ''}">${esc(task.title)}</h4>
      <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">${esc(task.description)}</p>
      <div class="mt-md flex items-center justify-between">
        <div class="flex -space-x-1">
          <div class="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold border-2 border-surface">
            ${assignee ? assignee.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'}
          </div>
        </div>
        <div class="flex items-center gap-1">
          ${canEdit ? `<button data-action="edit" data-id="${task.id}" class="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-1"><span class="material-symbols-outlined text-sm">edit</span></button>` : ''}
          ${isAdmin ? `<button data-action="delete" data-id="${task.id}" class="text-error font-label-sm text-label-sm hover:underline flex items-center gap-1 ml-1"><span class="material-symbols-outlined text-sm">delete</span></button>` : ''}
        </div>
      </div>
    </div>`;
}

export function handleSearch(e) {
  setSearchQuery(e.target.value);
  renderBoard();
}

export function renderBoard() {
  const q = state.searchQuery.toLowerCase();

  COLUMNS.forEach(status => {
    let tasks = state.allTasks.filter(t => t.status === status);
    if (q) tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );

    document.getElementById(`count-${status}`).textContent = tasks.length;

    const col = document.getElementById(`col-${status}`);
    col.innerHTML = tasks.length
      ? tasks.map(renderCard).join('')
      : '<div class="text-center text-on-surface-variant text-body-sm py-8">No tasks</div>';
  });
}
