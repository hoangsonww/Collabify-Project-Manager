import type { AppProps } from "next/app";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "@/styles/globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import "../i18n";
import { Suspense } from "react";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white" />
        </div>
      }
    >
      <UserProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
          <NavBar />

          <main className="flex-grow container mx-auto p-4">
            <Component {...pageProps} />
          </main>

          <Footer />

          {/* Sonner Toast Portal */}
          <Toaster position="bottom-right" richColors closeButton />
        </div>
      </UserProvider>
    </Suspense>
  );
}
