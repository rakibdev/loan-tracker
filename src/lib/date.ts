export const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const pad = (value: number) => String(value).padStart(2, "0")

export const toISO = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const parse = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export const today = () => toISO(new Date())

export const daysIn = (year: number, month: number) => new Date(year, month + 1, 0).getDate()

export const addMonths = (iso: string, count: number) => {
  const date = parse(iso)
  const day = date.getDate()
  date.setDate(1)
  date.setMonth(date.getMonth() + count)
  date.setDate(Math.min(day, daysIn(date.getFullYear(), date.getMonth())))
  return toISO(date)
}

export const addDays = (iso: string, count: number) => {
  const date = parse(iso)
  date.setDate(date.getDate() + count)
  return toISO(date)
}

export const monthsBetween = (from: string, to: string) => {
  const start = parse(from)
  const end = parse(to)
  const count = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()
  return Math.max(0, addMonths(from, count) > to ? count - 1 : count)
}

export const daysBetween = (from: string, to: string) =>
  Math.max(0, Math.round((parse(to).getTime() - parse(from).getTime()) / 86_400_000))

export const formatDate = (iso: string) => {
  const date = parse(iso)
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

export const fileDate = () => formatDate(today()).replaceAll(" ", "-")
