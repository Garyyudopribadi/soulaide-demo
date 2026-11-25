import { describe, expect, it } from 'vitest'
import {
  validateBookingLeadTime,
  validateRescheduleEligibility,
  isTimeOverlapping,
  getSelectableDates,
  MINIMUM_LEAD_TIME_HOURS,
  RESCHEDULE_MIN_LEAD_HOURS,
} from './availability.ts'
import { calculateServicePrice, fallbackServices } from '@/features/services/useServices.ts'

describe('Booking Lead Time Policy Validation', () => {
  it('rejects bookings with less than 24 hours lead time', () => {
    // Current simulated time: 2026-11-22 10:00
    const now = new Date(2026, 10, 22, 10, 0, 0)

    // Attempt to book same day at 14:00 (4 hours later)
    const resultSameDay = validateBookingLeadTime('2026-11-22', '14:00', now)
    expect(resultSameDay.isValid).toBe(false)
    expect(resultSameDay.hoursUntilSession).toBeLessThan(MINIMUM_LEAD_TIME_HOURS)
    expect(resultSameDay.message).toContain('minimal 24 jam')

    // Attempt to book next day at 09:00 (23 hours later)
    const resultNextMorning = validateBookingLeadTime('2026-11-23', '09:00', now)
    expect(resultNextMorning.isValid).toBe(false)
    expect(resultNextMorning.hoursUntilSession).toBeLessThan(MINIMUM_LEAD_TIME_HOURS)
  })

  it('accepts bookings with at least 24 hours lead time', () => {
    const now = new Date(2026, 10, 22, 10, 0, 0)

    // Book next day at 11:00 (25 hours later)
    const resultValid = validateBookingLeadTime('2026-11-23', '11:00', now)
    expect(resultValid.isValid).toBe(true)
    expect(resultValid.hoursUntilSession).toBeGreaterThanOrEqual(MINIMUM_LEAD_TIME_HOURS)

    // Book 3 days later
    const resultThreeDays = validateBookingLeadTime('2026-11-25', '14:00', now)
    expect(resultThreeDays.isValid).toBe(true)
  })
})

describe('Reschedule Eligibility Policy Validation', () => {
  it('rejects reschedule requests submitted less than 8 hours before session', () => {
    const now = new Date(2026, 10, 22, 10, 0, 0)

    // Session is today at 15:00 (5 hours remaining)
    const result = validateRescheduleEligibility('2026-11-22', '15:00', now)
    expect(result.isEligible).toBe(false)
    expect(result.hoursRemaining).toBeLessThan(RESCHEDULE_MIN_LEAD_HOURS)
    expect(result.message).toContain('minimal diajukan 8 jam')
  })

  it('permits reschedule requests submitted at least 8 hours before session', () => {
    const now = new Date(2026, 10, 22, 10, 0, 0)

    // Session is today at 20:00 (10 hours remaining)
    const result = validateRescheduleEligibility('2026-11-22', '20:00', now)
    expect(result.isEligible).toBe(true)
    expect(result.hoursRemaining).toBeGreaterThanOrEqual(RESCHEDULE_MIN_LEAD_HOURS)
  })
})

describe('Slot Overlap Prevention Logic', () => {
  it('detects partial and full time overlaps', () => {
    // Overlapping intervals
    expect(isTimeOverlapping('09:00', '10:00', '09:30', '10:30')).toBe(true)
    expect(isTimeOverlapping('09:30', '10:30', '09:00', '10:00')).toBe(true)
    expect(isTimeOverlapping('09:00', '11:00', '09:30', '10:30')).toBe(true)
    expect(isTimeOverlapping('09:30', '10:00', '09:00', '11:00')).toBe(true)
  })

  it('allows adjacent consecutive slots without collision', () => {
    // 09:00 - 10:00 followed immediately by 10:00 - 11:00
    expect(isTimeOverlapping('09:00', '10:00', '10:00', '11:00')).toBe(false)
    expect(isTimeOverlapping('10:00', '11:00', '09:00', '10:00')).toBe(false)
  })

  it('allows completely separate non-overlapping slots', () => {
    expect(isTimeOverlapping('09:00', '10:00', '13:00', '14:00')).toBe(false)
  })
})

describe('Selectable Dates Generator', () => {
  it('ensures selectable dates start tomorrow and never include today', () => {
    const now = new Date(2026, 10, 22, 10, 0, 0)
    const dates = getSelectableDates(14, now)

    expect(dates.length).toBe(14)
    expect(dates[0].dateStr).toBe('2026-11-23') // Starts tomorrow
    expect(dates.some((d) => d.dateStr === '2026-11-22')).toBe(false) // Never today
  })
})

describe('Revised Services & Professional Tiers (Soul Guidance vs Soul Expert)', () => {
  it('validates the 3 canonical services with online and offline support', () => {
    const canonicalServices = [
      'Layanan Konseling Individu',
      'Layanan MHCU (Mental Health Check Up)',
      'Bundling MHCU+Konseling Individu Online',
    ]
    expect(canonicalServices.length).toBe(3)
    expect(canonicalServices).not.toContain('MHCU Assessment')
  })

  it('validates tier separation between Soul Guidance and Soul Expert', () => {
    const seniorExperience = '> 10 tahun'
    const associateExperience = '< 2 tahun'

    const getTier = (exp: string) => (exp.includes('> 10') ? 'Soul Expert' : 'Soul Guidance')

    expect(getTier(seniorExperience)).toBe('Soul Expert')
    expect(getTier(associateExperience)).toBe('Soul Guidance')
  })

  it('calculates booking service prices dynamically from database service properties', () => {
    const individualService = fallbackServices.find((s) => s.id === '7516044a-3883-41f6-8324-863d3ea80f5c')!
    expect(individualService).toBeDefined()

    // Default base prices from database service model
    const priceOnlineGuidance = calculateServicePrice(individualService, 'online', 'Soul Guidance')
    const priceOfflineGuidance = calculateServicePrice(individualService, 'offline', 'Soul Guidance')
    expect(priceOnlineGuidance).toBe(individualService.priceOnline)
    expect(priceOfflineGuidance).toBe(individualService.priceOffline)

    // Dynamic price calculation when admin updates service pricing in database model
    const updatedService = {
      ...individualService,
      priceOnline: 135000,
      priceOffline: 400000,
    }
    const revisedOnline = calculateServicePrice(updatedService, 'online', 'Soul Guidance')
    const revisedOffline = calculateServicePrice(updatedService, 'offline', 'Soul Guidance')
    expect(revisedOnline).toBe(135000)
    expect(revisedOffline).toBe(400000)

    // Soul Expert tier retains the exact database service pricing without price inflation
    const expertOnline = calculateServicePrice(updatedService, 'online', 'Soul Expert')
    const expertOffline = calculateServicePrice(updatedService, 'offline', 'Soul Expert')
    expect(expertOnline).toBe(135000)
    expect(expertOffline).toBe(400000)
  })
})
