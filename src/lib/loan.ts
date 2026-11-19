import { addMonths, monthsBetween, today } from "./date"
import { round } from "./money"

export type Kind = "given" | "taken"
export type Interest = "flat" | "monthly" | "yearly"

export type Loan = {
  id: number
  kind: Kind
  name: string
  phone: string
  amount: number
  currency: string
  date: string
  interest: Interest
  rate: number
  installment: number | null
  due: string | null
  note: string
}

export type Payment = {
  id: number
  loan: number
  amount: number
  date: string
  note: string
}

export type Row = { date: string; amount: number; paid: number }

export type Entry = ReturnType<typeof summarize>

const interestFor = ({ amount, interest, rate }: Loan, months: number) =>
  round({ flat: (amount * rate) / 100, monthly: (amount * rate * months) / 100, yearly: (amount * rate * months) / 1200 }[interest])

const schedule = (start: string, installment: number, total: number, paid: number) => {
  const rows: Row[] = []
  let pool = paid
  for (let index = 1, rest = total; rest > 0.005; index++) {
    const amount = round(Math.min(installment, rest))
    const covered = Math.min(pool, amount)
    pool -= covered
    rest = round(rest - amount)
    rows.push({ date: addMonths(start, index), amount, paid: covered })
  }
  return rows
}

export const summarize = (loan: Loan, payments: Payment[], now = today()) => {
  let paid = 0
  let settled: string | undefined
  for (const payment of payments.toSorted((a, b) => a.date.localeCompare(b.date))) {
    paid = round(paid + payment.amount)
    settled ??= paid >= loan.amount + interestFor(loan, monthsBetween(loan.date, payment.date)) ? payment.date : undefined
  }
  const end = settled ?? now
  const months = monthsBetween(loan.date, end)
  const accrued = interestFor(loan, months)
  const total = round(loan.amount + accrued)
  const left = Math.max(0, round(total - paid))
  const rows = loan.installment ? schedule(loan.date, loan.installment, total, paid) : []
  const next = left ? (loan.installment ? rows.find(row => row.paid < row.amount)?.date : loan.due) : undefined
  const overdue = !!left && (loan.installment ? rows.some(row => row.date < now && row.paid < row.amount) : !!loan.due && loan.due < now)
  return { ...loan, payments, end, months, accrued, total, paid, left, rows, next, overdue, settled: !left }
}

export const byCurrency = (loans: Entry[]) => {
  const groups = new Map<string, Entry[]>()
  for (const loan of loans) groups.get(loan.currency)?.push(loan) ?? groups.set(loan.currency, [loan])
  return [...groups]
}
