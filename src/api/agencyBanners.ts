import { fetchWithAuth } from '../lib/fetchWithAuth'
import { getAuthHeaders } from './auth'
import type { BannerResponse } from '../types/banner'

export interface AgencyBannerFormData {
  title: string
  imageUrl: string
  landingUrl: string
  exposureOrder: number
  startAt?: string
  endAt?: string
}

const BASE = '/api/v1/agency'

export async function getAgencyBanners(): Promise<BannerResponse[]> {
  const res = await fetchWithAuth(`${BASE}/banners`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error(`getAgencyBanners failed: ${res.status}`)
  const body = await res.json()
  return body.data as BannerResponse[]
}

export async function createAgencyBanner(data: AgencyBannerFormData): Promise<BannerResponse> {
  const res = await fetchWithAuth(`${BASE}/banners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`createAgencyBanner failed: ${res.status}`)
  const body = await res.json()
  return body.data as BannerResponse
}

export async function updateAgencyBanner(
  id: number,
  data: Partial<AgencyBannerFormData> & { isActive?: boolean },
): Promise<BannerResponse> {
  const res = await fetchWithAuth(`${BASE}/banners/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`updateAgencyBanner failed: ${res.status}`)
  const body = await res.json()
  return body.data as BannerResponse
}

export async function deleteAgencyBanner(id: number): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/banners/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`deleteAgencyBanner failed: ${res.status}`)
}

export async function requestAgencyPresignedUrl(
  contentType: string,
  contentLength: number,
): Promise<{ presignedUrl: string; imageUrl: string; expiresAt: string }> {
  const res = await fetchWithAuth(`${BASE}/uploads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ contentType, contentLength }),
  })
  if (!res.ok) throw new Error(`requestAgencyPresignedUrl failed: ${res.status}`)
  const body = await res.json()
  return body.data
}

export async function uploadToS3Agency(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type, 'Content-Length': String(file.size) },
    body: file,
  })
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`)
}