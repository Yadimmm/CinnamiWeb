// apiService.js

export async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: email, password }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || "Error en login");
  }

  return await response.json();
}

// Trae el usuario actualizado después de login.
// Ajusta la URL si tienes endpoint de usuario individual (más eficiente).
export async function getUserProfile(userId, token) {
  // Este endpoint devuelve TODOS los usuarios, busca el tuyo por ID.
  const response = await fetch('/api/auth/all-users', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (Array.isArray(data.users)) {
    return data.users.find(u => u._id === userId || u.id === userId);
  }
  return null;
}
