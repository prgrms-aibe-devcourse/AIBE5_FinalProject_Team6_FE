import type { AuthToken } from '../types/auth'

const BASE = '/api/v1/auth'
const TOKEN_KEY = 'fd_access_token'
const REFRESH_KEY = 'fd_refresh_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setToken(token: AuthToken): void {
  localStorage.setItem(TOKEN_KEY, token.accessToken)
  localStorage.setItem(REFRESH_KEY, token.refreshToken)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function login(email: string, password: string): Promise<AuthToken> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`login failed: ${res.status}`)
  const body = await res.json()
  return body.data as AuthToken
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    await fetch(`${BASE}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {})
  }
  clearToken()
}

export async function refresh(): Promise<AuthToken> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('no refresh token')
  const res = await fetch(`${BASE}/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) throw new Error(`refresh failed: ${res.status}`)
  const body = await res.json()
  const token = body.data as AuthToken
  setToken(token)
  return token
}