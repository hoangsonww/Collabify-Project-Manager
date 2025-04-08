"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Folder,
  User,
  Settings,
  LogOut,
  LogIn,
  Menu as MenuIcon,
  X as XIcon,
} from "lucide-react";

// 1) Import react-i18next & your i18n instance
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

// 2) Import shadcn's Select components
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// The "real" NavBar component
function NavBarInternal() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  // Allowed languages and default
  const allowedLangs = ["en", "vi"];
  const defaultLang = "en";

  // State for language, ensuring a default is always set
  const [lang, setLang] = useState(defaultLang);

  useEffect(() => {
    // On mount, read localStorage and set valid language
    const storedLang = localStorage.getItem("lang");
    if (storedLang && allowedLangs.includes(storedLang)) {
      setLang(storedLang);
      i18n.changeLanguage(storedLang);
    } else {
      setLang(defaultLang);
      i18n.changeLanguage(defaultLang);
      localStorage.setItem("lang", defaultLang);
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    const newLang = allowedLangs.includes(value) ? value : defaultLang;
    setLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  // Load translations from the "navbar" namespace
  const { t } = useTranslation("navbar");

  const fadeVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.nav
      className="w-full border-b border-gray-700 bg-brandPurple text-white"
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mx-auto w-[100%] px-4 py-3 flex items-center justify-between">
        <motion.div
          variants={fadeVariants}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="font-bold text-xl hover:opacity-80"
        >
          <Link href="/">Collabify</Link>
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center space-x-1 hover:opacity-80"
              >
                <LayoutDashboard size={16} />
                <span>{t("dashboard")}</span>
              </Link>
              <Link
                href="/projects"
                className="flex items-center space-x-1 hover:opacity-80"
              >
                <Folder size={16} />
                <span>{t("projects")}</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center space-x-1 hover:opacity-80"
              >
                <User size={16} />
                <span>{t("profile")}</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center space-x-1 hover:opacity-80"
              >
                <Settings size={16} />
                <span>{t("admin")}</span>
              </Link>
              <Link
                href="/api/auth/logout"
                className="flex items-center space-x-1 hover:opacity-80 text-red-500"
              >
                <LogOut size={16} className="text-red-500" />
                <span>{t("logout")}</span>
              </Link>
            </>
          ) : (
            <Link
              href="/api/auth/login"
              className="flex items-center space-x-1 hover:opacity-80"
            >
              <LogIn size={16} />
              <span>{t("loginSignUp")}</span>
            </Link>
          )}

          {/* Language Selector (Desktop) */}
          <Select value={lang} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-auto truncate">
              <SelectValue placeholder={t("language")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t("english")}</SelectItem>
              <SelectItem value="vi">{t("vietnamese")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="border border-white px-2 py-1 rounded hover:opacity-80 transition-colors"
          >
            {isOpen ? <XIcon size={16} /> : <MenuIcon size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden border-t border-gray-300 bg-black text-white"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex flex-col px-4 py-2 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-1 hover:opacity-80"
                  >
                    <LayoutDashboard size={16} />
                    <span>{t("dashboard")}</span>
                  </Link>
                  <Link
                    href="/projects"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-1 hover:opacity-80"
                  >
                    <Folder size={16} />
                    <span>{t("projects")}</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-1 hover:opacity-80"
                  >
                    <User size={16} />
                    <span>{t("profile")}</span>
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-1 hover:opacity-80"
                  >
                    <Settings size={16} />
                    <span>{t("admin")}</span>
                  </Link>
                  <Link
                    href="/api/auth/logout"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-1 hover:opacity-80 text-red-500"
                  >
                    <LogOut size={16} className="text-red-500" />
                    <span>{t("logout")}</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/api/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-1 hover:opacity-80"
                >
                  <LogIn size={16} />
                  <span>{t("loginSignUp")}</span>
                </Link>
              )}

              {/* Language Selector (Mobile) */}
              <Select value={lang} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder={t("language")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("english")}</SelectItem>
                  <SelectItem value="vi">{t("vietnamese")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// (4) Export a client-only version to avoid SSR/hydration mismatches
import dynamic from "next/dynamic";
export default dynamic(() => Promise.resolve(NavBarInternal), { ssr: false });
