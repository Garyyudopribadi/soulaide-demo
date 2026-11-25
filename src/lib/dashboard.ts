const WEEKDAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export const toDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

export const addDays = (date: Date, amount: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export interface DayWindow {
  date: string
  label: string
  shortDate: string
  isToday: boolean
}

export const getDayWindow = (count = 7, start: Date = new Date()): DayWindow[] => {
  const todayKey = toDateKey(start)

  return Array.from({ length: count }, (_, index) => {
    const date = addDays(start, index)
    const dateKey = toDateKey(date)
    return {
      date: dateKey,
      label: WEEKDAY_SHORT[date.getDay()],
      shortDate: `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`,
      isToday: dateKey === todayKey,
    }
  })
}

export const countByDate = <T extends { session_date: string }>(
  items: T[],
  dateKeys: string[]
): Record<string, number> => {
  const counts = Object.fromEntries(dateKeys.map((key) => [key, 0]))
  for (const item of items) {
    if (item.session_date in counts) {
      counts[item.session_date] += 1
    }
  }
  return counts
}

export const formatSessionDate = (dateKey: string, withWeekday = true): string => {
  const date = parseDateKey(dateKey)
  const day = date.getDate()
  const month = MONTH_SHORT[date.getMonth()]
  const year = date.getFullYear()
  return withWeekday
    ? `${WEEKDAY_SHORT[date.getDay()]}, ${day} ${month} ${year}`
    : `${day} ${month} ${year}`
}

export const getRelativeDateLabel = (dateKey: string, now: Date = new Date()): string => {
  const today = toDateKey(now)
  const tomorrow = toDateKey(addDays(now, 1))
  if (dateKey === today) return 'Hari ini'
  if (dateKey === tomorrow) return 'Besok'
  return formatSessionDate(dateKey, true)
}

export const formatClock = (time: string): string => time.slice(0, 5)

export interface ProfileCompletionInput {
  full_name?: string | null
  phone_number?: string | null
  date_of_birth?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
}

export interface ProfileCompletion {
  percent: number
  missing: string[]
}

export const getProfileCompletion = (profile: ProfileCompletionInput | null): ProfileCompletion => {
  const checks: Array<{ label: string; complete: boolean }> = [
    { label: 'Nama lengkap', complete: Boolean(profile?.full_name?.trim()) },
    { label: 'Nomor WhatsApp', complete: Boolean(profile?.phone_number?.trim()) },
    { label: 'Tanggal lahir', complete: Boolean(profile?.date_of_birth) },
    {
      label: 'Nama kontak darurat',
      complete: Boolean(profile?.emergency_contact_name?.trim()),
    },
    {
      label: 'Nomor kontak darurat',
      complete: Boolean(profile?.emergency_contact_phone?.trim()),
    },
  ]

  const completed = checks.filter((check) => check.complete).length
  return {
    percent: Math.round((completed / checks.length) * 100),
    missing: checks.filter((check) => !check.complete).map((check) => check.label),
  }
}

export const getInitials = (name: string): string => {
  const parts = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return 'SL'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
