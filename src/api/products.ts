import type { ProductListItem, ProductListResponse, ProductResponse } from '../types/product'
import { getAuthHeaders, getFanIdHeader } from './auth'
import { fetchWithAuth } from '../lib/fetchWithAuth'

export interface CreateProductRequest {
  artistId: number
  name: string
  price: number
  totalQty: number
  type: 'regular' | 'drops'
  dropsStartAt?: string
  dropsEndAt?: string
  imageUrls?: string[]
}

export type { ProductListItem, ProductResponse }

const BASE = '/api/v1/products'

export async function getProducts(
  type = 'regular',
  cursor?: string,
  size = 20,
  artistId?: number,
): Promise<ProductListResponse> {
  const params = new URLSearchParams({ type, size: String(size) })
  if (cursor !== undefined) params.set('cursor', String(cursor))
  if (artistId !== undefined) params.set('artistId', String(artistId))
  const res = await fetchWithAuth(`${BASE}?${params}`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error(`getProducts failed: ${res.status}`)
  const body = await res.json()
  return body.data as ProductListResponse
}

export async function getProduct(id: number): Promise<ProductResponse> {
  const res = await fetchWithAuth(`${BASE}/${id}`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error(`getProduct failed: ${res.status}`)
  const body = await res.json()
  return body.data as ProductResponse
}

export async function subscribeRestock(productId: number): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/${productId}/restock-subscribe`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader() },
  })
  if (!res.ok) throw new Error(`subscribeRestock failed: ${res.status}`)
}

export async function createProduct(data: CreateProductRequest): Promise<{ productId: number }> {
  const res = await fetchWithAuth(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`createProduct failed: ${res.status}`)
  const body = await res.json()
  return body.data as { productId: number }
}

export async function unsubscribeRestock(productId: number): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/${productId}/restock-subscribe`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders(), 'X-Fan-Id': getFanIdHeader() },
  })
  if (!res.ok) throw new Error(`unsubscribeRestock failed: ${res.status}`)
}

export interface UpdateProductRequest {
  name?: string
  price?: number
  status?: string
  dropsStartAt?: string
  dropsEndAt?: string
  imageUrls?: string[] | null
}

export async function updateProduct(
  id: number,
  data: UpdateProductRequest,
): Promise<{ productId: number; status: string }> {
  const res = await fetchWithAuth(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`updateProduct failed: ${res.status}`)
  const body = await res.json()
  return body.data as { productId: number; status: string }
}

export async function restockProduct(
  productId: number,
  quantity: number,
): Promise<{ productId: number; totalQty: number }> {
  const res = await fetchWithAuth(`${BASE}/${productId}/restock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ quantity }),
  })
  if (!res.ok) throw new Error(`restockProduct failed: ${res.status}`)
  const body = await res.json()
  return body.data as { productId: number; totalQty: number }
}