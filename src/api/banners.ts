import type { BannerResponse, StoreBannerResponse } from '../types/banner'

const BASE = '/api/v1/banners'

export async function getMainBanners(): Promise<BannerResponse[]> {
  const res = await fetch(`${BASE}/main`)
  if (!res.ok) throw new Error(`getMainBanners failed: ${res.status}`)
  const body = await res.json()
  return body.data as BannerResponse[]
}

export async function getStoreBanners(): Promise<StoreBannerResponse[]> {
  const res = await fetch('/api/v1/store-banners')
  if (!res.ok) throw new Error(`getStoreBanners failed: ${res.status}`)
  const body = await res.json()
  return body.data as StoreBannerResponse[]
}