import { argbFromHex, hexFromArgb, Scheme } from "@material/material-color-utilities"
import { DarkTheme, DefaultTheme } from "expo-router"
import { useColorScheme } from "react-native"
import { MD3DarkTheme, MD3LightTheme, useTheme } from "react-native-paper"
import { useSettings } from "./settings"

const seed = argbFromHex("#00bfff")

const mix = (base: string, tint: string, amount: number) => {
  const channel = (hex: string, index: number) => parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16)
  return `#${[0, 1, 2].map(index => Math.round(channel(base, index) * (1 - amount) + channel(tint, index) * amount).toString(16).padStart(2, "0")).join("")}`
}

const palette = (scheme: Scheme) => {
  const colors = Object.fromEntries(Object.entries(scheme.toJSON()).map(([key, value]) => [key, hexFromArgb(value)]))
  const levels = [0, 0.05, 0.08, 0.11, 0.12, 0.14].map(amount => mix(colors.surface, colors.primary, amount))
  return { ...colors, elevation: Object.fromEntries(levels.map((color, index) => [`level${index}`, index ? color : "transparent"])) }
}

const light = { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, ...palette(Scheme.light(seed)), success: "#1b7a3d", successContainer: "#c8f0d2", warning: "#b45309", warningContainer: "#fde7c8" } }
const dark = { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, ...palette(Scheme.dark(seed)), success: "#7ddc96", successContainer: "#0f5129", warning: "#fbbf6a", warningContainer: "#5c3a0a" } }

export type AppTheme = typeof light

export const useAppTheme = () => useTheme<AppTheme>()

export const useThemes = () => {
  const { theme } = useSettings()
  const system = useColorScheme()
  const isDark = theme == "dark" || (theme == "system" && system == "dark")
  const paper = isDark ? dark : light
  const base = isDark ? DarkTheme : DefaultTheme
  const { colors } = paper
  return {
    isDark,
    paper,
    navigation: {
      ...base,
      colors: { ...base.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.onSurface, border: colors.outlineVariant, notification: colors.error },
    },
  }
}
