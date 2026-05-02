const BASE = import.meta.env.VITE_API_URL || '';

export function getToken() {
  return localStorage.getItem('edutj_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('edutj_token', token);
  else localStorage.removeItem('edutj_token');
}

export async function api(path, options = {}) {
  const headers = { ...options.headers };
  const isForm = options.body instanceof FormData;
  if (!isForm) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, { ...options, headers });
  let data = {};
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || res.statusText };
  }
  if (!res.ok) {
    const msg =
      data.error ||
      (Array.isArray(data.details) ? data.details.map((d) => d.message).join(', ') : null) ||
      res.statusText;
    const err = new Error(msg);
    err.details = data.details;
    err.status = res.status;
    throw err;
  }
  return data;
}
