import { fetchWithAuth } from '../lib/fetchWithAuth'
import { getAuthHeaders } from './auth'
import type { BannerResponse, StoreBannerResponse } from '../types/banner'

export interface PresignedUrlResponse {
  presignedUrl: string
  imageUrl: string
  expiresAt: string
}

export interface BannerFormData {
  title: string
  imageUrl: string
  landingUrl: string
  exposureOrder: number
  startAt: string
  endAt: string
}

export interface StoreBannerFormData extends BannerFormData {
  productId: number | null
}

const BASE = '/api/v1/admin'

export async function getAdminMainBanners(): Promise<BannerResponse[]> {
  const res = await fetchWithAuth(`${BASE}/main-banners`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error(`getAdminMainBanners failed: ${res.status}`)
  const body = await res.json()
  return body.data as BannerResponse[]
}

export async function createAdminMainBanner(data: BannerFormData): Promise<BannerResponse> {
  const res = await fetchWithAuth(`${BASE}/main-banners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`createAdminMainBanner failed: ${res.status}`)
  const body = await res.json()
  return body.data as BannerResponse
}

export async function updateAdminMainBanner(
  id: number,
  data: BannerFormData & { isActive: boolean },
): Promise<BannerResponse> {
  const res = await fetchWithAuth(`${BASE}/main-banners/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`updateAdminMainBanner failed: ${res.status}`)
  const body = await res.json()
  return body.data as BannerResponse
}

export async function deleteAdminMainBanner(id: number): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/main-banners/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`deleteAdminMainBanner failed: ${res.status}`)
}

export async function createAdminStoreBanner(data: StoreBannerFormData): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/store-banners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`createAdminStoreBanner failed: ${res.status}`)
}

export async function updateAdminStoreBanner(id: number, data: StoreBannerFormData): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/store-banners/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`updateAdminStoreBanner failed: ${res.status}`)
}

export async function deleteAdminStoreBanner(id: number): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/store-banners/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`deleteAdminStoreBanner failed: ${res.status}`)
}

export async function requestPresignedUrl(
  contentType: string,
  contentLength: number,
): Promise<PresignedUrlResponse> {
  const res = await fetchWithAuth(`${BASE}/uploads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ contentType, contentLength }),
  })
  if (!res.ok) throw new Error(`requestPresignedUrl failed: ${res.status}`)
  const body = await res.json()
  return body.data as PresignedUrlResponse
}

export async function uploadToS3(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`)
}

export type { BannerResponse, StoreBannerResponse }