export async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: email, password }),
  });

  // Puedes manejar diferentes status aquí
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || "Error en login");
  }

  return await response.json();
}
