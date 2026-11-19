import { router, Stack, useLocalSearchParams } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"
import { useTranslation } from "react-i18next"
import { LoanForm } from "@/components/LoanForm"
import { MoreMenu } from "@/components/MoreMenu"
import { deleteLoan, loadLoan, useFocusLoad } from "@/lib/db"
import { remind } from "@/lib/remind"

export default function EditLoan() {
  const { t } = useTranslation()
  const db = useSQLiteContext()
  const id = Number(useLocalSearchParams<{ id: string }>().id)
  const loan = useFocusLoad(db => loadLoan(db, id))

  const remove = async () => {
    await deleteLoan(db, id)
    await remind(id)
    router.dismissTo("/")
  }

  return (
    <>
      <Stack.Screen options={{ headerRight: () => <MoreMenu message={t("deleteLoan")} onDelete={remove} /> }} />
      {loan && <LoanForm loan={loan} onSaved={() => router.back()} />}
    </>
  )
}
