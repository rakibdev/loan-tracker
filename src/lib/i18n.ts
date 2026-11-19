import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import bn from "@/locales/bn"
import en from "@/locales/en"
import { loadSettings } from "./settings"

export const ready = loadSettings().then(({ language }) =>
  i18n.use(initReactI18next).init({
    resources: { bn: { translation: bn }, en: { translation: en } },
    lng: language,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  }),
)

export default i18n
