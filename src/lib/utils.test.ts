import { describe, expect, it } from 'vitest'
import { cn, formatIDR, formatWhatsAppNumber, cleanWhatsAppNumber } from './utils.ts'

describe('cn utility', () => {
  it('combines class names correctly', () => {
    expect(cn('px-2 py-1', 'bg-blue-500')).toBe('px-2 py-1 bg-blue-500')
  })

  it('merges tailwind conflicts correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })
})

describe('formatIDR utility', () => {
  it('formats Indonesian Rupiah properly', () => {
    const formatted = formatIDR(110000)
    expect(formatted).toContain('110.000')
  })
})

describe('WhatsApp formatting utilities', () => {
  it('formats Indonesian mobile numbers to standard display format', () => {
    expect(formatWhatsAppNumber('+6289630869804')).toBe('+62 896-3086-9804')
    expect(formatWhatsAppNumber('6289630869804')).toBe('+62 896-3086-9804')
    expect(formatWhatsAppNumber('089630869804')).toBe('+62 896-3086-9804')
  })

  it('cleans WhatsApp numbers for wa.me URLs', () => {
    expect(cleanWhatsAppNumber('+62 896-3086-9804')).toBe('6289630869804')
    expect(cleanWhatsAppNumber('0896-3086-9804')).toBe('6289630869804')
  })
})
