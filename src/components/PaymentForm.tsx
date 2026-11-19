import { useSQLiteContext } from "expo-sqlite"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ScrollView } from "react-native"
import { Button, TextInput } from "react-native-paper"
import { today } from "@/lib/date"
import { loadLoan, savePayment } from "@/lib/db"
import type { Payment } from "@/lib/loan"
import { currencies, grouped, parseMoney } from "@/lib/money"
import { remind } from "@/lib/remind"
import { DateField } from "./DateField"

type Props = { loan: number; currency: string; payment?: Payment; onSaved: () => void }

export const PaymentForm = ({ loan, currency, payment, onSaved }: Props) => {
  const { t } = useTranslation()
  const db = useSQLiteContext()
  const [form, setForm] = useState({
    amount: grouped(String(payment?.amount ?? "")),
    date: payment?.date ?? today(),
    note: payment?.note ?? "",
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await savePayment(db, { id: payment?.id, loan, amount: parseMoney(form.amount), date: form.date, note: form.note.trim() })
    await remind(loan, await loadLoan(db, loan))
    onSaved()
  }

  return (
    <ScrollView contentContainerClassName="gap-4 p-4" keyboardShouldPersistTaps="handled">
      <TextInput
        mode="outlined"
        label={t("amount")}
        keyboardType="decimal-pad"
        value={form.amount}
        onChangeText={text => setForm(current => ({ ...current, amount: grouped(text) }))}
        left={<TextInput.Affix text={currencies[currency] ?? currency} />}
      />
      <DateField value={form.date} onChange={date => setForm(current => ({ ...current, date }))} />
      <TextInput mode="outlined" label={`${t("note")} (${t("optional")})`} multiline value={form.note} onChangeText={note => setForm(current => ({ ...current, note }))} />
      <Button mode="contained" disabled={!(parseMoney(form.amount) > 0) || saving} loading={saving} onPress={save}>
        {t("save")}
      </Button>
    </ScrollView>
  )
}
