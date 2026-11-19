import { router, Stack, useLocalSearchParams } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"
import { useTranslation } from "react-i18next"
import { MoreMenu } from "@/components/MoreMenu"
import { PaymentForm } from "@/components/PaymentForm"
import { deletePayment, loadLoan, loadPayment, useFocusLoad } from "@/lib/db"
import { remind } from "@/lib/remind"

export default function EditPayment() {
  const { t } = useTranslation()
  const db = useSQLiteContext()
  const id = Number(useLocalSearchParams<{ id: string }>().id)
  const data = useFocusLoad(async db => {
    const payment = await loadPayment(db, id)
    return payment && { payment, loan: await loadLoan(db, payment.loan) }
  })

  const remove = async () => {
    if (!data) return
    await deletePayment(db, id)
    await remind(data.payment.loan, await loadLoan(db, data.payment.loan))
    router.back()
  }

  return (
    <>
      <Stack.Screen options={{ headerRight: () => <MoreMenu message={t("deletePayment")} onDelete={remove} /> }} />
      {data?.loan && <PaymentForm loan={data.payment.loan} currency={data.loan.currency} payment={data.payment} onSaved={() => router.back()} />}
    </>
  )
}
