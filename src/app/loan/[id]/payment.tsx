import { router, useLocalSearchParams } from "expo-router"
import { PaymentForm } from "@/components/PaymentForm"
import { loadLoan, useFocusLoad } from "@/lib/db"

export default function NewPayment() {
  const id = Number(useLocalSearchParams<{ id: string }>().id)
  const loan = useFocusLoad(db => loadLoan(db, id))
  return loan && <PaymentForm loan={id} currency={loan.currency} onSaved={() => router.back()} />
}
