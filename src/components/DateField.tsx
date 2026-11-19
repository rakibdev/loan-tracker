import { useState } from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { TextInput } from "react-native-paper"
import { daysIn, monthNames, parse, toISO } from "@/lib/date"
import { Select } from "./Select"

const months = monthNames.map((label, value) => ({ value, label }))

type Props = { value: string; onChange: (value: string) => void }

export const DateField = ({ value, onChange }: Props) => {
  const { t } = useTranslation()
  const date = parse(value)
  const [day, setDay] = useState(String(date.getDate()))
  const [year, setYear] = useState(String(date.getFullYear()))

  const update = (nextYear: number, month: number, nextDay: number, typing = false) => {
    const clamped = Math.min(Math.max(nextDay, 1), daysIn(nextYear, month))
    if (!typing) setDay(String(clamped))
    onChange(toISO(new Date(nextYear, month, clamped)))
  }

  return (
    <View className="flex-row gap-2">
      <TextInput
        className="flex-1"
        mode="outlined"
        label={t("day")}
        keyboardType="number-pad"
        maxLength={2}
        value={day}
        onChangeText={text => {
          setDay(text)
          if (Number(text)) update(date.getFullYear(), date.getMonth(), Number(text), true)
        }}
        onBlur={() => setDay(String(date.getDate()))}
      />
      <Select className="flex-1" label={t("month")} value={date.getMonth()} options={months} onChange={month => update(date.getFullYear(), month, date.getDate())} />
      <TextInput
        className="flex-1"
        mode="outlined"
        label={t("year")}
        keyboardType="number-pad"
        maxLength={4}
        value={year}
        onChangeText={text => {
          setYear(text)
          if (text.length == 4) update(Number(text), date.getMonth(), date.getDate())
        }}
        onBlur={() => setYear(String(date.getFullYear()))}
      />
    </View>
  )
}
