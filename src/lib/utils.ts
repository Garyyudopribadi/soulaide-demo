import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('62') && digits.length >= 11) {
    const part1 = digits.slice(2, 5)
    const part2 = digits.slice(5, 9)
    const part3 = digits.slice(9)
    return `+62 ${part1}-${part2}-${part3}`
  }
  if (digits.startsWith('0') && digits.length >= 10) {
    const part1 = digits.slice(1, 4)
    const part2 = digits.slice(4, 8)
    const part3 = digits.slice(8)
    return `+62 ${part1}-${part2}-${part3}`
  }
  return phone
}

export function cleanWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1)
  }
  return digits
}

const SUPABASE_STORAGE_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL || 'https://cyzsmbuwqxjedimcwpga.supabase.co'}/storage/v1/object/public/public-assets`

/**
 * Returns the Supabase Storage CDN URL for public assets.
 * Example: getAssetUrl('/Psikolog/Card - Amanda Natasanti S. Psi., Psikolog.webp')
 */
export function getAssetUrl(relativePath: string): string {
  if (!relativePath) return ''
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
  // Encode each path segment to handle spaces and special characters safely in URL
  const encodedPath = cleanPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `${SUPABASE_STORAGE_BASE_URL}/${encodedPath}`
}

/**
 * Handles image load errors gracefully by trying the local fallback if remote CDN failed,
 * or swapping to the official logo if the asset cannot be found.
 */
export function handleImageFallback(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  localFallbackPath = '/Soulaide Psi Arc Logo.webp'
) {
  const target = e.currentTarget

  // Try decoding or switching format if .jpg was requested instead of .webp
  if (!target.dataset.triedWebp && target.src.endsWith('.jpg')) {
    target.dataset.triedWebp = 'true'
    target.src = target.src.replace(/\.jpg$/, '.webp')
    return
  }

  if (!target.dataset.triedLocalFallback) {
    target.dataset.triedLocalFallback = 'true'
    // Extract relative path from Supabase storage URL if possible
    if (target.src.includes('/storage/v1/object/public/public-assets/')) {
      const parts = target.src.split('/storage/v1/object/public/public-assets/')
      if (parts[1]) {
        target.src = `/${decodeURIComponent(parts[1])}`
        return
      }
    }
    target.src = localFallbackPath
  } else if (!target.dataset.triedDefaultLogo) {
    target.dataset.triedDefaultLogo = 'true'
    target.src = '/Soulaide Psi Arc Logo.webp'
  }
}

