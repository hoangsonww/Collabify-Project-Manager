// pages/index.tsx
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

// ✅ Block SSR for this page to avoid hydration mismatch
const ClientOnlyPage = dynamic(() => Promise.resolve(HomePage), { ssr: false });

export default function Index() {
  return <ClientOnlyPage />;
}

// ✅ Real page content, runs only on client so i18n works right
function HomePage() {
  const { t } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{t("title")}</h1>
      <p>{t("subtitle")}</p>

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={() => handleLanguageChange("en")}
          style={{ marginRight: "1rem" }}
        >
          English
        </button>
        <button onClick={() => handleLanguageChange("vi")}>Vietnamese</button>
      </div>
    </main>
  );
}
