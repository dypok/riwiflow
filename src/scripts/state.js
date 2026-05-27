export let currentUser = null;
export let allUsers    = [];
export let allTasks    = [];
export let searchQuery = '';

export function setCurrentUser(u) { currentUser = u; }
export function setAllUsers(u)    { allUsers = u; }
export function setAllTasks(t)    { allTasks = t; }
export function setSearchQuery(q) { searchQuery = q; }
