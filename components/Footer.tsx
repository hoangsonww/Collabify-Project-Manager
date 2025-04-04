"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Globe } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

function FooterInternal() {
  const { t } = useTranslation("footer");
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className="w-full border-t border-gray-700 bg-brandPurple text-white text-sm py-4 mt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <span>{t("copyright", { year: currentYear })}</span>
          <span>
            {t("builtWith", { love: t("love") })} {t("by")}{" "}
            <Link
              href="https://sonnguyenhoang.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-300 transition-colors"
            >
              {t("sonNguyen")}
            </Link>
            .
          </span>
        </div>
        <div className="flex gap-4 mt-2 md:mt-0">
          <Link
            href="https://github.com/hoangsonww"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            <Github size={16} />
            <span className="hidden md:inline">{t("github")}</span>
          </Link>
          <Link
            href="https://www.linkedin.com/in/hoangsonw"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            <Linkedin size={16} />
            <span className="hidden md:inline">{t("linkedin")}</span>
          </Link>
          <Link
            href="mailto:hoangson091104@gmail.com"
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            <Mail size={16} />
            <span className="hidden md:inline">{t("email")}</span>
          </Link>
          <Link
            href="https://sonnguyenhoang.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            <Globe size={16} />
            <span className="hidden md:inline">{t("website")}</span>
          </Link>
        </div>
      </div>
    </motion.footer>
  );
}

export default dynamic(() => Promise.resolve(FooterInternal), { ssr: false });
