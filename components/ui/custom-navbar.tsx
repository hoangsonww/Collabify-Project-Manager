"use client";

import * as React from "react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function CustomNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen((o) => !o);

  return (
    <nav className="w-full bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left side brand/logo */}
        <Link
          href="/"
          className="text-lg font-bold text-brandPurple hover:opacity-80"
        >
          ProjectMgr
        </Link>

        {/* Hamburger Button (mobile) */}
        <div className="md:hidden">
          <Button variant="outline" onClick={handleToggle}>
            {isOpen ? "Close" : "Menu"}
          </Button>
        </div>

        {/* Desktop NavLinks */}
        <div className="hidden md:flex space-x-6">
          <Link href="/dashboard" className="hover:opacity-80">
            Dashboard
          </Link>
          <Link href="/projects" className="hover:opacity-80">
            Projects
          </Link>
          <Link href="/profile" className="hover:opacity-80">
            Profile
          </Link>
          <Link href="/admin" className="hover:opacity-80">
            Admin
          </Link>
          {/* Example: logout button */}
          <Link href="/api/auth/logout" className="hover:opacity-80">
            Logout
          </Link>
        </div>
      </div>

      {/* Mobile Menu (collapsible) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-4 py-2 flex flex-col space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="hover:opacity-80"
              >
                Dashboard
              </Link>
              <Link
                href="/projects"
                onClick={() => setIsOpen(false)}
                className="hover:opacity-80"
              >
                Projects
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="hover:opacity-80"
              >
                Profile
              </Link>
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="hover:opacity-80"
              >
                Admin
              </Link>
              <Link
                href="/api/auth/logout"
                onClick={() => setIsOpen(false)}
                className="hover:opacity-80"
              >
                Logout
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
