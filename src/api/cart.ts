import type { CartResponse } from '../types/cart'
import { getAuthHeaders, getFanIdHeader } from './auth'
import { fetchWithAuth } from '../lib/fetchWithAuth'

const BASE = '/api/v1/cart'

function cartHeaders(extra?: Record<string, string>): Record<string, string> {
  return { ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader(), ...extra }
}

export async function getCart(): Promise<CartResponse> {
  const res = await fetchWithAuth(BASE, { headers: cartHeaders() })
  if (!res.ok) throw new Error(`getCart failed: ${res.status}`)
  const body = await res.json()
  return body.data as CartResponse
}

export async function addCartItem(productId: number, quantity: number): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/items`, {
    method: 'POST',
    headers: cartHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ productId, quantity }),
  })
  if (!res.ok) throw new Error(`addCartItem failed: ${res.status}`)
}

export async function updateCartItem(cartItemId: number, quantity: number): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/items/${cartItemId}`, {
    method: 'PATCH',
    headers: cartHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ quantity }),
  })
  if (!res.ok) throw new Error(`updateCartItem failed: ${res.status}`)
}

export async function removeCartItem(cartItemId: number): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/items/${cartItemId}`, {
    method: 'DELETE',
    headers: cartHeaders(),
  })
  if (!res.ok) throw new Error(`removeCartItem failed: ${res.status}`)
}
