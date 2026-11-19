import { router } from "expo-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FlatList, ScrollView, View } from "react-native"
import { Chip, FAB, IconButton, Menu, Searchbar, Text } from "react-native-paper"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LoanRow } from "@/components/LoanRow"
import { addDays, today } from "@/lib/date"
import { loadLoans, useFocusLoad } from "@/lib/db"
import type { Entry } from "@/lib/loan"

const chips = ["all", "given", "taken", "paid"] as const
const dues = { any: "dueAny", overdue: "dueOverdue", week: "dueWeek", month: "dueMonth" } as const

type Chip = (typeof chips)[number]
type Due = keyof typeof dues

const matchesDue = (loan: Entry, due: Due) => {
  if (due == "any") return true
  if (due == "overdue") return loan.overdue
  const now = today()
  return !!loan.next && loan.next >= now && loan.next <= addDays(now, due == "week" ? 7 : 30)
}

export default function Home() {
  const { t } = useTranslation()
  const { top } = useSafeAreaInsets()
  const loans = useFocusLoad(loadLoans)
  const [query, setQuery] = useState("")
  const [chip, setChip] = useState<Chip>("all")
  const [due, setDue] = useState<Due>("any")
  const [menu, setMenu] = useState(false)

  const search = query.trim().toLowerCase()
  const visible = loans?.filter(
    loan =>
      (chip == "all" || (chip == "paid" ? loan.settled : !loan.settled && loan.kind == chip)) &&
      matchesDue(loan, due) &&
      [loan.name, loan.phone, loan.note].some(field => field.toLowerCase().includes(search)),
  )

  return (
    <View className="flex-1">
      <View className="flex-row items-center gap-1 pl-4 pr-1 pt-3" style={{ paddingTop: top + 12 }}>
        <Searchbar className="flex-1" placeholder={t("search")} value={query} onChangeText={setQuery} />
        <IconButton icon="cog-outline" onPress={() => router.push("/settings")} />
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4 py-3">
          {chips.map(key => (
            <Chip key={key} selected={chip == key} showSelectedOverlay onPress={() => setChip(key)}>
              {t(key)}
            </Chip>
          ))}
          <Menu
            visible={menu}
            onDismiss={() => setMenu(false)}
            anchor={
              <Chip selected={due != "any"} showSelectedOverlay icon="chevron-down" onPress={() => setMenu(true)}>
                {t(due == "any" ? "due" : dues[due])}
              </Chip>
            }
          >
            {Object.entries(dues).map(([key, label]) => (
              <Menu.Item
                key={key}
                title={t(label)}
                trailingIcon={key == due ? "check" : undefined}
                onPress={() => {
                  setDue(key as Due)
                  setMenu(false)
                }}
              />
            ))}
          </Menu>
        </ScrollView>
      </View>
      <FlatList
        data={visible}
        keyExtractor={loan => String(loan.id)}
        renderItem={({ item }) => <LoanRow loan={item} />}
        contentContainerClassName="gap-3 px-4 pb-24"
        ListEmptyComponent={
          loans && (
            <Text variant="titleMedium" className="pt-16 text-center">
              {t(loans.length ? "noMatch" : "empty")}
            </Text>
          )
        }
      />
      <FAB icon="plus" className="absolute bottom-4 right-4" onPress={() => router.push("/loan/new")} />
    </View>
  )
}
