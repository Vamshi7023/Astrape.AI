export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export const storage = {
  getToken: () => localStorage.getItem('token') || '',
  setToken: (t) => localStorage.setItem('token', t || ''),
  clearToken: () => localStorage.removeItem('token'),
  setUser: (u) => localStorage.setItem('user', JSON.stringify(u || null)),
  getUser: () => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } }
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = storage.getToken()
  if (auth && token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const text = await res.text()
  let data; try { data = text ? JSON.parse(text) : {} } catch { data = { message: text } }
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`)
  return data
}
