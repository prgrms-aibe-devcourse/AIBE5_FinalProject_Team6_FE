import type { AgencyApplication, ApplicationStatus } from '../types/partnership'
import { getAuthHeaders } from './auth'

const B2B_BASE = '/api/v1/b2b'
const ADMIN_BASE = '/api/v1/admin'

interface BeApplicationResponse {
  id: number
  companyName: string
  businessRegistrationNumber: string
  representativeName: string
  contactEmail: string
  contactPhone: string
  introduction: string
  targetArtistName: string
  status: string
  rejectReason: string | null
  appliedAt: string
  reviewedAt: string | null
}

export interface ApplyAgencyRequest {
  companyName: string
  businessRegistrationNumber: string
  representativeName: string
  contactEmail: string
  contactPhone: string
  introduction: string
  targetArtistName: string
}

function mapApplication(be: BeApplicationResponse): AgencyApplication {
  return {
    id: String(be.id),
    companyName: be.companyName,
    businessRegistrationNumber: be.businessRegistrationNumber,
    ceoName: be.representativeName,
    managerName: be.representativeName,
    businessEmail: be.contactEmail,
    contactNumber: be.contactPhone,
    artistName: be.targetArtistName,
    artistType: '',
    platforms: [],
    services: [],
    introduction: be.introduction,
    status: be.status as ApplicationStatus,
    appliedAt: be.appliedAt,
    rejectionReason: be.rejectReason ?? undefined,
  }
}

export async function applyAgency(req: ApplyAgencyRequest): Promise<AgencyApplication> {
  const res = await fetch(`${B2B_BASE}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`applyAgency failed: ${res.status}`)
  const body = await res.json()
  return mapApplication(body.data as BeApplicationResponse)
}

export async function getAdminApplications(
  status?: ApplicationStatus | 'ALL',
): Promise<AgencyApplication[]> {
  const params = new URLSearchParams()
  if (status && status !== 'ALL') params.set('status', status)
  const res = await fetch(`${ADMIN_BASE}/artist-applications?${params}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`getAdminApplications failed: ${res.status}`)
  const body = await res.json()
  return (body.data as BeApplicationResponse[]).map(mapApplication)
}

export async function reviewApplication(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  rejectReason?: string,
): Promise<void> {
  const res = await fetch(`${ADMIN_BASE}/artist-applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ status, rejectReason }),
  })
  if (!res.ok) throw new Error(`reviewApplication failed: ${res.status}`)
}
