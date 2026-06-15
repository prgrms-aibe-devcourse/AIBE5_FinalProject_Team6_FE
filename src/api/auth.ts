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

/** JWT payload의 sub claim을 fanId로 추출. 서명 검증 없이 Base64 디코딩만 수행한다. */
function extractFanIdFromJwt(token: string): string | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(b64)) as { sub?: unknown }
    return payload.sub != null ? String(payload.sub) : null
  } catch {
    return null
  }
}

/** X-Fan-Id 헤더 값. JWT sub claim → 없으면 localStorage 'fd_fan_id' → 없으면 '1'(로컬 폴백). */
export function getFanIdHeader(): string {
  const token = getToken()
  if (token) {
    const id = extractFanIdFromJwt(token)
    if (id) return id
  }
  return localStorage.getItem('fd_fan_id') ?? '1'
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

export function getArtistIdHeader(artistId: number): Record<string, string> {
  return { 'X-Artist-Id': String(artistId) }
}

export function getArtistMemberIdHeader(memberId: number): Record<string, string> {
  return { 'X-Artist-Member-Id': String(memberId) }
}

export async function signup(
  email: string,
  password: string,
  nickname: string,
): Promise<AuthToken> {
  const res = await fetch(`${BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nickname, termsAgreed: true }),
  })
  if (!res.ok) throw new Error(`signup failed: ${res.status}`)
  const body = await res.json()
  return body.data as AuthToken
}

export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch(`${BASE}/password-reset/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) throw new Error(`requestPasswordReset failed: ${res.status}`)
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${BASE}/password-reset/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  })
  if (!res.ok) throw new Error(`confirmPasswordReset failed: ${res.status}`)
}

export async function socialLogin(provider: string, code: string): Promise<AuthToken> {
  const res = await fetch(`${BASE}/social/${provider.toLowerCase()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error(`socialLogin failed: ${res.status}`)
  const body = await res.json()
  return body.data as AuthToken
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