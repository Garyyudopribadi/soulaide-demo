import { describe, expect, it } from 'vitest'
import {
  countByDate,
  formatClock,
  formatSessionDate,
  getDayWindow,
  getInitials,
  getProfileCompletion,
  getRelativeDateLabel,
  parseDateKey,
  toDateKey,
} from './dashboard'

describe('dashboard date helpers', () => {
  const reference = new Date(2026, 10, 22, 10, 30, 0)

  it('formats a local date key without shifting the day', () => {
    expect(toDateKey(reference)).toBe('2026-11-22')
    expect(toDateKey(parseDateKey('2026-11-22'))).toBe('2026-11-22')
  })

  it('builds a seven day window with today marked', () => {
    const days = getDayWindow(7, reference)

    expect(days).toHaveLength(7)
    expect(days[0]).toMatchObject({ date: '2026-11-22', isToday: true })
    expect(days[1].date).toBe('2026-11-23')
    expect(days[6].date).toBe('2026-11-28')
  })

  it('counts bookings only inside the requested window', () => {
    const days = getDayWindow(3, reference)
    const bookings = [
      { id: 'a', session_date: '2026-11-22' },
      { id: 'b', session_date: '2026-11-22' },
      { id: 'c', session_date: '2026-11-24' },
      { id: 'd', session_date: '2026-12-01' },
    ]

    expect(countByDate(bookings, days.map((day) => day.date))).toEqual({
      '2026-11-22': 2,
      '2026-11-23': 0,
      '2026-11-24': 1,
    })
  })

  it('uses human friendly labels for today and tomorrow', () => {
    expect(getRelativeDateLabel('2026-11-22', reference)).toBe('Hari ini')
    expect(getRelativeDateLabel('2026-11-23', reference)).toBe('Besok')
    expect(getRelativeDateLabel('2026-11-25', reference)).toContain('25 Nov 2026')
  })

  it('formats times and session dates consistently', () => {
    expect(formatClock('10:30:00')).toBe('10:30')
    expect(formatSessionDate('2026-11-22', false)).toBe('22 Nov 2026')
  })
})

describe('profile completion', () => {
  it('reports 0 percent and every missing field for an empty profile', () => {
    const result = getProfileCompletion(null)
    expect(result.percent).toBe(0)
    expect(result.missing).toHaveLength(5)
  })

  it('reports a complete profile at 100 percent', () => {
    const result = getProfileCompletion({
      full_name: 'Rina Kartika',
      phone_number: '081234567890',
      date_of_birth: '1994-04-10',
      emergency_contact_name: 'Budi',
      emergency_contact_phone: '081298765432',
    })

    expect(result.percent).toBe(100)
    expect(result.missing).toEqual([])
  })

  it('tracks partially completed profiles', () => {
    const result = getProfileCompletion({
      full_name: 'Rina Kartika',
      phone_number: '   ',
      date_of_birth: '1994-04-10',
      emergency_contact_name: '',
      emergency_contact_phone: null,
    })

    expect(result.percent).toBe(40)
    expect(result.missing).toEqual([
      'Nomor WhatsApp',
      'Nama kontak darurat',
      'Nomor kontak darurat',
    ])
  })
})

describe('dashboard identity helpers', () => {
  it('creates stable initials for common names', () => {
    expect(getInitials('Sarah Jenkins, M.Psi.')).toBe('SP')
    expect(getInitials('Soulaide')).toBe('SO')
    expect(getInitials('')).toBe('SL')
  })
})
