import { useFocusEffect } from "expo-router"
import { type SQLiteDatabase, useSQLiteContext } from "expo-sqlite"
import { useCallback, useState } from "react"
import { type Loan, type Payment, summarize } from "./loan"

export type LoanDraft = Omit<Loan, "id"> & { id?: number }
export type PaymentDraft = Omit<Payment, "id"> & { id?: number }

export const migrate = (db: SQLiteDatabase) =>
  db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      date TEXT NOT NULL,
      interest TEXT NOT NULL,
      rate REAL NOT NULL DEFAULT 0,
      installment REAL,
      due TEXT,
      note TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS payments_loan ON payments(loan);
  `)

const paymentsOrder = "ORDER BY date DESC, id DESC"

export const loadLoans = async (db: SQLiteDatabase) => {
  const [loans, payments] = await Promise.all([
    db.getAllAsync<Loan>("SELECT * FROM loans ORDER BY date DESC, id DESC"),
    db.getAllAsync<Payment>(`SELECT * FROM payments ${paymentsOrder}`),
  ])
  const byLoan = new Map<number, Payment[]>()
  for (const payment of payments) byLoan.get(payment.loan)?.push(payment) ?? byLoan.set(payment.loan, [payment])
  return loans.map(loan => summarize(loan, byLoan.get(loan.id) ?? []))
}

export const loadLoan = async (db: SQLiteDatabase, id: number) => {
  const loan = await db.getFirstAsync<Loan>("SELECT * FROM loans WHERE id = ?", id)
  if (!loan) return
  return summarize(loan, await db.getAllAsync<Payment>(`SELECT * FROM payments WHERE loan = ? ${paymentsOrder}`, id))
}

export const loadPayment = (db: SQLiteDatabase, id: number) => db.getFirstAsync<Payment>("SELECT * FROM payments WHERE id = ?", id)

export const saveLoan = async (db: SQLiteDatabase, { id, ...loan }: LoanDraft) => {
  const values = [loan.kind, loan.name, loan.phone, loan.amount, loan.currency, loan.date, loan.interest, loan.rate, loan.installment, loan.due, loan.note]
  if (id) {
    await db.runAsync(
      "UPDATE loans SET kind = ?, name = ?, phone = ?, amount = ?, currency = ?, date = ?, interest = ?, rate = ?, installment = ?, due = ?, note = ? WHERE id = ?",
      [...values, id],
    )
    return id
  }
  const result = await db.runAsync(
    "INSERT INTO loans (kind, name, phone, amount, currency, date, interest, rate, installment, due, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    values,
  )
  return result.lastInsertRowId
}

export const deleteLoan = (db: SQLiteDatabase, id: number) => db.runAsync("DELETE FROM loans WHERE id = ?", id)

export const savePayment = async (db: SQLiteDatabase, { id, loan, amount, date, note }: PaymentDraft) => {
  if (id) await db.runAsync("UPDATE payments SET amount = ?, date = ?, note = ? WHERE id = ?", [amount, date, note, id])
  else await db.runAsync("INSERT INTO payments (loan, amount, date, note) VALUES (?, ?, ?, ?)", [loan, amount, date, note])
}

export const deletePayment = (db: SQLiteDatabase, id: number) => db.runAsync("DELETE FROM payments WHERE id = ?", id)

export const useFocusLoad = <T,>(load: (db: SQLiteDatabase) => Promise<T>) => {
  const db = useSQLiteContext()
  const [data, setData] = useState<T>()
  useFocusEffect(
    useCallback(() => {
      load(db).then(setData)
    }, [db]),
  )
  return data
}
