import Storage from "expo-sqlite/kv-store"
import { useSyncExternalStore } from "react"

export type Theme = "system" | "light" | "dark"
export type Language = "bn" | "en"

type Settings = { theme: Theme; language: Language; currency: string }

let settings: Settings = { theme: "light", language: "en", currency: "BDT" }

const listeners = new Set<() => void>()

export const getSettings = () => settings

export const loadSettings = async () => {
  const [theme, language, currency] = await Promise.all([Storage.getItem("theme"), Storage.getItem("language"), Storage.getItem("currency")])
  settings = { theme: (theme as Theme) ?? settings.theme, language: (language as Language) ?? settings.language, currency: currency ?? settings.currency }
  return settings
}

export const setSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
  settings = { ...settings, [key]: value }
  Storage.setItem(key, value)
  for (const listener of listeners) listener()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useSettings = () => useSyncExternalStore(subscribe, getSettings)
