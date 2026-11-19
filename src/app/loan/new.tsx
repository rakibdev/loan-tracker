import { router } from "expo-router"
import { LoanForm } from "@/components/LoanForm"

export default function NewLoan() {
  return <LoanForm onSaved={id => router.replace(`/loan/${id}`)} />
}
