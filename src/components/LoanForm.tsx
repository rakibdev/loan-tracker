import { useSQLiteContext } from "expo-sqlite"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ScrollView, View } from "react-native"
import { Button, SegmentedButtons, Switch, Text, TextInput } from "react-native-paper"
import { addMonths, today } from "@/lib/date"
import { type LoanDraft, loadLoan, saveLoan } from "@/lib/db"
import type { Interest, Kind, Loan } from "@/lib/loan"
import { currencies, grouped, parseMoney } from "@/lib/money"
import { allowReminders, remind } from "@/lib/remind"
import { getSettings, setSetting } from "@/lib/settings"
import { DateField } from "./DateField"
import { Select } from "./Select"

const numeric = (text: string) => text.replace(/[^\d.]/g, "")

const blank = () => {
  const date = today()
  return { kind: "given" as Kind, name: "", phone: "", amount: "", currency: getSettings().currency, date, interest: "monthly" as Interest, rate: "", installment: "", due: addMonths(date, 1), hasDue: true, note: "" }
}

const fromLoan = (loan: Loan) => ({
  ...loan,
  amount: grouped(String(loan.amount)),
  rate: loan.rate ? String(loan.rate) : "",
  installment: loan.installment ? grouped(String(loan.installment)) : "",
  due: loan.due ?? addMonths(loan.date, 1),
  hasDue: !!loan.due,
})

export const LoanForm = ({ loan, onSaved }: { loan?: Loan; onSaved: (id: number) => void }) => {
  const { t } = useTranslation()
  const db = useSQLiteContext()
  const [form, setForm] = useState(() => (loan ? fromLoan(loan) : blank()))
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof typeof form>(key: K) => (value: (typeof form)[K]) => setForm(current => ({ ...current, [key]: value }))

  const installment = parseMoney(form.installment) || null
  const valid = !!form.name.trim() && parseMoney(form.amount) > 0

  const save = async () => {
    setSaving(true)
    const draft: LoanDraft = {
      id: loan?.id,
      kind: form.kind,
      name: form.name.trim(),
      phone: form.phone.trim(),
      amount: parseMoney(form.amount),
      currency: form.currency,
      date: form.date,
      interest: form.interest,
      rate: Number(form.rate) || 0,
      installment,
      due: !installment && form.hasDue ? form.due : null,
      note: form.note.trim(),
    }
    const id = await saveLoan(db, draft)
    setSetting("currency", form.currency)
    await allowReminders()
    await remind(id, await loadLoan(db, id))
    onSaved(id)
  }

  return (
    <ScrollView contentContainerClassName="gap-8 p-4 pb-10" keyboardShouldPersistTaps="handled">
      <SegmentedButtons
        value={form.kind}
        onValueChange={value => set("kind")(value as Kind)}
        buttons={[
          { value: "given", label: t("given"), icon: "arrow-top-right" },
          { value: "taken", label: t("taken"), icon: "arrow-bottom-left" },
        ]}
      />
      <View className="gap-3">
        <TextInput mode="outlined" label={t("name")} value={form.name} onChangeText={set("name")} />
        <View className="flex-row gap-2">
          <TextInput className="flex-1" mode="outlined" label={t("amount")} keyboardType="decimal-pad" value={form.amount} onChangeText={text => set("amount")(grouped(text))} />
          <Select className="w-28" label={t("currency")} value={form.currency} options={Object.keys(currencies).map(code => ({ value: code, label: code }))} onChange={set("currency")} />
        </View>
        <TextInput mode="outlined" label={`${t("phone")} (${t("optional")})`} keyboardType="phone-pad" value={form.phone} onChangeText={set("phone")} />
        <TextInput mode="outlined" label={`${t("note")} (${t("optional")})`} multiline value={form.note} onChangeText={set("note")} />
      </View>
      <DateField value={form.date} onChange={set("date")} />
      <View className="gap-3">
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1"
            mode="outlined"
            label={t("rate")}
            placeholder="0"
            keyboardType="decimal-pad"
            value={form.rate}
            onChangeText={text => set("rate")(numeric(text))}
            right={<TextInput.Affix text="%" />}
          />
          <Select
            className="flex-1"
            label={t("interest")}
            value={form.interest}
            options={(["flat", "monthly", "yearly"] as const).map(value => ({ value, label: t(value) }))}
            onChange={set("interest")}
          />
        </View>
        <TextInput
          mode="outlined"
          label={`${t("installment")} (${t("optional")})`}
          keyboardType="decimal-pad"
          value={form.installment}
          onChangeText={text => set("installment")(grouped(text))}
          left={<TextInput.Affix text={currencies[form.currency] ?? form.currency} />}
        />
      </View>
      {!installment && (
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text variant="bodyLarge">{t("dueDate")}</Text>
            <Switch value={form.hasDue} onValueChange={set("hasDue")} />
          </View>
          {form.hasDue && <DateField value={form.due} onChange={set("due")} />}
        </View>
      )}
      <Button mode="contained" disabled={!valid || saving} loading={saving} onPress={save}>
        {t("save")}
      </Button>
    </ScrollView>
  )
}
