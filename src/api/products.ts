import type { ProductListResponse, ProductResponse } from '../types/product'
import { getAuthHeaders } from './auth'

const BASE = '/api/v1/products'

export async function getProducts(
  type = 'regular',
  cursor?: string,
  size = 20,
): Promise<ProductListResponse> {
  const params = new URLSearchParams({ type, size: String(size) })
  if (cursor !== undefined) params.set('cursor', String(cursor))
  const res = await fetch(`${BASE}?${params}`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error(`getProducts failed: ${res.status}`)
  const body = await res.json()
  return body.data as ProductListResponse
}

export async function getProduct(id: number): Promise<ProductResponse> {
  const res = await fetch(`${BASE}/${id}`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error(`getProduct failed: ${res.status}`)
  const body = await res.json()
  return body.data as ProductResponse
}