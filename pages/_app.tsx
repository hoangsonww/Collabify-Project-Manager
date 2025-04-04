import type { AppProps } from "next/app";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "@/styles/globals.css";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
        {/* Custom NavBar at the top */}
        <NavBar />

        <main className="flex-grow container mx-auto p-4">
          <Component {...pageProps} />
        </main>

        <Footer />

        {/* Sonner Toast Portal */}
        <Toaster position="bottom-right" richColors closeButton />
      </div>
    </UserProvider>
  );
}
