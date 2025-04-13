import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: true,

    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json", // translation path
    },

    interpolation: {
      escapeValue: false, // not needed for React
    },

    react: {
      useSuspense: true,
      ssr: false,
    },
  });

export default i18n;
