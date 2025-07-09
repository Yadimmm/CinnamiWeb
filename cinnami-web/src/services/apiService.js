import { API_BASE_URL } from '../utils/constant';             

// INICIAR SESIÓN
export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: email, password }),
  });

  if (!response.ok) {
    let errMsg = "Error en login";
    try {
      const errData = await response.json();
      errMsg = errData.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  return await response.json();
}

// TRAER PERFIL DE USUARIO (por ID, después de login)
export async function getUserProfile(userId, token) {
  const response = await fetch(`${API_BASE_URL}/all-users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (Array.isArray(data.users)) {
    return data.users.find(u => u._id === userId || u.id === userId);
  }
  return null;
}

// REGISTRAR USUARIO
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    let errMsg = "Error al registrar usuario";
    try {
      const errData = await response.json();
      errMsg = errData.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  return await response.json();
}

// ACTUALIZAR DATOS DE USUARIO
export async function updateUser(userId, userData, token) {
  const response = await fetch(`${API_BASE_URL}/${userId}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    let errMsg = "Error al actualizar usuario";
    try {
      const errData = await response.json();
      errMsg = errData.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  return await response.json();
}

// OBTENER TARJETAS
export async function getAllCards(token) {
  const response = await fetch(`${API_BASE_URL}/cards`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Error al obtener tarjetas");
  return await response.json();
}

// OBTENER UNA TARJETA POR UID
export async function getCardByUID(uid, token) {
  const data = await getAllCards(token);
  if (Array.isArray(data.cards)) {
    return data.cards.find(card => card.uid === uid);
  }
  return null;
}
