/**
 * Availability & Slot Calculation Engine for Soulaide
 * Operational Timezone: Asia/Jakarta (WIB, UTC+7)
 */

export interface TimeSlot {
  startTime: string // HH:mm format, e.g. "09:00"
  endTime: string   // HH:mm format, e.g. "10:00"
  isAvailable: boolean
  reason?: string
}

export const MINIMUM_LEAD_TIME_HOURS = 24
export const RESCHEDULE_MIN_LEAD_HOURS = 8

/**
 * Validates if a target booking session time meets the minimum lead time policy (24 hours).
 * Both sessionDate (YYYY-MM-DD) and sessionTime (HH:mm) are interpreted in Asia/Jakarta.
 */
export function validateBookingLeadTime(
  sessionDateStr: string,
  sessionTimeStr: string,
  now: Date = new Date()
): { isValid: boolean; hoursUntilSession: number; message?: string } {
  const [year, month, day] = sessionDateStr.split('-').map(Number)
  const [hours, minutes] = sessionTimeStr.split(':').map(Number)

  // Construct target session timestamp
  const sessionTarget = new Date(year, month - 1, day, hours, minutes, 0)
  const diffMs = sessionTarget.getTime() - now.getTime()
  const hoursUntilSession = diffMs / (1000 * 60 * 60)

  if (hoursUntilSession < MINIMUM_LEAD_TIME_HOURS) {
    return {
      isValid: false,
      hoursUntilSession,
      message: `Pemesanan sesi membutuhkan waktu persiapan (lead time) minimal ${MINIMUM_LEAD_TIME_HOURS} jam. Waktu yang dipilih tersisa ${Math.max(0, Math.floor(hoursUntilSession))} jam.`,
    }
  }

  return { isValid: true, hoursUntilSession }
}

/**
 * Validates if a reschedule request is submitted at least 8 hours before the scheduled session.
 */
export function validateRescheduleEligibility(
  sessionDateStr: string,
  sessionTimeStr: string,
  now: Date = new Date()
): { isEligible: boolean; hoursRemaining: number; message?: string } {
  const [year, month, day] = sessionDateStr.split('-').map(Number)
  const [hours, minutes] = sessionTimeStr.split(':').map(Number)

  const sessionTarget = new Date(year, month - 1, day, hours, minutes, 0)
  const diffMs = sessionTarget.getTime() - now.getTime()
  const hoursRemaining = diffMs / (1000 * 60 * 60)

  if (hoursRemaining < RESCHEDULE_MIN_LEAD_HOURS) {
    return {
      isEligible: false,
      hoursRemaining,
      message: `Permintaan perubahan jadwal (reschedule) minimal diajukan ${RESCHEDULE_MIN_LEAD_HOURS} jam sebelum sesi berlangsung.`,
    }
  }

  return { isEligible: true, hoursRemaining }
}

/**
 * Checks if two time intervals overlap.
 */
export function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && endA > startB
}

/**
 * Generates selectable dates starting from tomorrow + lead time.
 */
export function getSelectableDates(count: number = 14, now: Date = new Date()): Array<{ dateStr: string; label: string; dayOfWeek: number }> {
  const dates: Array<{ dateStr: string; label: string; dayOfWeek: number }> = []

  // Day 0 is today, Day 1 is tomorrow. Lead time 24 hours means earliest possible is tomorrow or day after.
  const startDay = new Date(now)
  startDay.setDate(startDay.getDate() + 1)

  for (let i = 0; i < count; i++) {
    const current = new Date(startDay)
    current.setDate(startDay.getDate() + i)

    const year = current.getFullYear()
    const month = String(current.getMonth() + 1).padStart(2, '0')
    const day = String(current.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    const label = new Intl.DateTimeFormat('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(current)

    dates.push({
      dateStr,
      label,
      dayOfWeek: current.getDay(),
    })
  }

  return dates
}

/**
 * Default standard slots available for psychologists on weekdays and weekends.
 */
export const DEFAULT_DAILY_SLOTS: string[] = [
  '09:00',
  '10:30',
  '13:00',
  '14:30',
  '16:00',
  '19:00',
  '20:30',
]
