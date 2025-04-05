import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { Button } from "@/components/ui/button";

const ClientOnlyPage = dynamic(() => Promise.resolve(HomePage), { ssr: false });

export default function Index() {
  return <ClientOnlyPage />;
}

function HomePage() {
  const { t } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-none p-6">
      <div className="w-full max-w-2xl space-y-6 rounded-lg bg-none p-8 shadow">
        <h1 className="text-4xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        <div className="mt-8 flex gap-4">
          <Button variant="outline" onClick={() => handleLanguageChange("en")}>
            English
          </Button>
          <Button variant="outline" onClick={() => handleLanguageChange("vi")}>
            Vietnamese
          </Button>
        </div>
      </div>
    </main>
  );
}
