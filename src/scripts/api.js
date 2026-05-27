const API = 'http://localhost:3001';

export async function loginUser(email, password) {
  const res = await fetch(`${API}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API}/users`);
  return res.json();
}

export async function fetchTasks() {
  const res = await fetch(`${API}/tasks`);
  return res.json();
}

export async function createTask(data) {
  const res = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTask(id, data) {
  const res = await fetch(`${API}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteTask(id) {
  await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
}
