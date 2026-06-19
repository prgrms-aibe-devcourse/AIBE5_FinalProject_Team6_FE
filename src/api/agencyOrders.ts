import { fetchWithAuth } from '../lib/fetchWithAuth'
import { getAuthHeaders } from './auth'

export interface AgencyOrderItem {
  orderId: number
  status: string
  totalAmount: number
  createdAt: string
  productSummary: string
  artistId: number
  artistName: string
}

export interface AgencyOrderListResult {
  items: AgencyOrderItem[]
  nextCursor: string | null
}

export async function getAgencyOrders(
  artistId?: number,
  cursor?: string,
  size = 20,
): Promise<AgencyOrderListResult> {
  const params = new URLSearchParams({ size: String(size) })
  if (artistId) params.set('artistId', String(artistId))
  if (cursor) params.set('cursor', cursor)
  const res = await fetchWithAuth(`/api/v1/agency/orders?${params}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`getAgencyOrders failed: ${res.status}`)
  const body = await res.json()
  return body.data as AgencyOrderListResult
}
