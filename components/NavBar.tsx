"use client";

import Link from "next/link";
import { useState } from "react";
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

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

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
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <motion.div
          variants={fadeVariants}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="font-bold text-xl hover:opacity-80"
        >
          <Link href="/">Collabify</Link>
        </motion.div>

        <div className="hidden md:flex items-center space-x-6">
          {user && (
            <>
              <Link
                href="/dashboard"
                className="flex items-center space-x-1 hover:opacity-80"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/projects"
                className="flex items-center space-x-1 hover:opacity-80"
              >
                <Folder size={16} />
                <span>Projects</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center space-x-1 hover:opacity-80"
              >
                <User size={16} />
                <span>Profile</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center space-x-1 hover:opacity-80"
              >
                <Settings size={16} />
                <span>Admin</span>
              </Link>
              <Link
                href="/api/auth/logout"
                className="flex items-center space-x-1 hover:opacity-80 text-red-500"
              >
                <LogOut size={16} className="text-red-500" />
                <span>Logout</span>
              </Link>
            </>
          )}
          {!user && (
            <Link
              href="/api/auth/login"
              className="flex items-center space-x-1 hover:opacity-80"
            >
              <LogIn size={16} />
              <span>Login / Sign Up</span>
            </Link>
          )}
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="border border-white px-2 py-1 rounded hover:opacity-80 transition-colors"
          >
            {isOpen ? <XIcon size={16} /> : <MenuIcon size={16} />}
          </button>
        </div>
      </div>

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
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-1 hover:opacity-80"
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/projects"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-1 hover:opacity-80"
                  >
                    <Folder size={16} />
                    <span>Projects</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-1 hover:opacity-80"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-1 hover:opacity-80"
                  >
                    <Settings size={16} />
                    <span>Admin</span>
                  </Link>
                  <Link
                    href="/api/auth/logout"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-1 hover:opacity-80 text-red-500"
                  >
                    <LogOut size={16} className="text-red-500" />
                    <span>Logout</span>
                  </Link>
                </>
              )}
              {!user && (
                <Link
                  href="/api/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-1 hover:opacity-80"
                >
                  <LogIn size={16} />
                  <span>Login / Sign Up</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
