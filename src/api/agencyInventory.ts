import { fetchWithAuth } from '../lib/fetchWithAuth'
import { getAuthHeaders } from './auth'

export interface InventoryHistoryItem {
  historyId: number
  inventoryId: number
  changeType: string
  deltaQty: number
  qtyBefore: number
  qtyAfter: number
  referenceId: number | null
  refType: string
  changedAt: string
  productId: number
  productName: string
}

export interface InventoryHistoryListResult {
  items: InventoryHistoryItem[]
  nextCursor: string | null
}

export async function getAgencyInventoryHistory(
  artistId?: number,
  productId?: number,
  cursor?: string,
  size = 20,
): Promise<InventoryHistoryListResult> {
  const params = new URLSearchParams({ size: String(size) })
  if (artistId) params.set('artistId', String(artistId))
  if (productId) params.set('productId', String(productId))
  if (cursor) params.set('cursor', cursor)
  const res = await fetchWithAuth(`/api/v1/agency/inventory/history?${params}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`getAgencyInventoryHistory failed: ${res.status}`)
  const body = await res.json()
  return body.data as InventoryHistoryListResult
}
