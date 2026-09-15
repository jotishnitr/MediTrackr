import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import te from "./locales/te.json";
import ta from "./locales/ta.json";
import bn from "./locales/bn.json";
import mr from "./locales/mr.json";
import gu from "./locales/gu.json";
import kn from "./locales/kn.json";
import ml from "./locales/ml.json";
import or from "./locales/or.json";
import pa from "./locales/pa.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
];

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
  ta: { translation: ta },
  bn: { translation: bn },
  mr: { translation: mr },
  gu: { translation: gu },
  kn: { translation: kn },
  ml: { translation: ml },
  or: { translation: or },
  pa: { translation: pa },
};

// Check if a saved language preference exists
const savedLanguage = localStorage.getItem("meditrackr_lang") || "en";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "en",
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "meditrackr_lang",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Keep localStorage in sync whenever language changes
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("meditrackr_lang", lng);
  document.documentElement.lang = lng;
});

export default i18n;
