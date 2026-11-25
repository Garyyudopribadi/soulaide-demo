export type UserRole = 'customer' | 'psychologist' | 'admin' | 'super_admin'

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'reschedule_requested'
  | 'rescheduled'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'refunded'
  | 'partially_refunded'

export type PresenceStatus =
  | 'offline'
  | 'online'
  | 'available'
  | 'busy'
  | 'away'

export type DeliveryMethod = 'online' | 'offline'

export type ProfessionalTier = 'Soul Guidance' | 'Soul Expert'

export interface PsychologistProfile {
  id: string
  slug?: string
  fullName: string
  credentials: string
  experienceYears: string
  initialSchedule: string
  practiceAreas: string[]
  approaches: string[]
  cardImage: string
  profileImage: string
  tier?: ProfessionalTier
}

export interface ServiceDetail {
  id: string
  title: string
  category: 'Soul Guidance' | 'Soul Expert'
  duration: string
  method: string
  price: number | null
  priceOnline?: number | null
  priceOffline?: number | null
  deliveryMethods?: DeliveryMethod[]
  description: string
  isConfirmedPrice: boolean
  features?: string[]
}
