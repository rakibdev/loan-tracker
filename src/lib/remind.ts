import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import { parse } from "./date"
import i18n from "./i18n"
import type { Entry } from "./loan"
import { money } from "./money"

const native = Platform.OS != "web"

const at9 = (iso: string) => {
  const date = parse(iso)
  date.setHours(9)
  return date
}

export const setupReminders = () => {
  if (!native) return
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  })
  Notifications.setNotificationChannelAsync("reminders", { name: i18n.t("remindChannel"), importance: Notifications.AndroidImportance.HIGH })
}

export const allowReminders = async () => {
  if (native) await Notifications.requestPermissionsAsync()
}

const forget = async (prefix: string) => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  await Promise.all(
    scheduled.filter(({ identifier }) => identifier.startsWith(prefix)).map(({ identifier }) => Notifications.cancelScheduledNotificationAsync(identifier)),
  )
}

const schedule = (loan: Entry) => {
  if (loan.settled) return []
  const dates = loan.installment
    ? loan.rows.filter(row => row.paid < row.amount).map(row => ({ date: row.date, amount: row.amount - row.paid }))
    : loan.due
      ? [{ date: loan.due, amount: loan.left }]
      : []
  return dates
    .filter(({ date }) => at9(date) > new Date())
    .map(({ date, amount }) =>
      Notifications.scheduleNotificationAsync({
        identifier: `loan-${loan.id}-${date}`,
        content: { title: loan.name, body: i18n.t("dueToday", { amount: money(amount, loan.currency) }) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at9(date), channelId: "reminders" },
      }),
    )
}

export const remind = async (id: number, loan?: Entry) => {
  if (!native) return
  await forget(`loan-${id}-`)
  if (loan) await Promise.all(schedule(loan))
}

export const remindAll = async (loans: Entry[]) => {
  if (!native) return
  await forget("loan-")
  await Promise.all(loans.flatMap(schedule))
}
