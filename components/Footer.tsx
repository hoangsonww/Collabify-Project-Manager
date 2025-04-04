import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Globe } from "lucide-react";

export function Footer() {
  return (
    <motion.footer
      className="w-full border-t border-gray-700 bg-brandPurple text-white text-sm py-4 mt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <span>
            © {new Date().getFullYear()} Collabify. All rights reserved.
          </span>
          <span>
            Built with{" "}
            <span role="img" aria-label="love">
              ❤️
            </span>{" "}
            by{" "}
            <Link
              href="https://sonnguyenhoang.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-300 transition-colors"
            >
              Son Nguyen
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
            <span className="hidden md:inline">GitHub</span>
          </Link>
          <Link
            href="https://www.linkedin.com/in/hoangsonw"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            <Linkedin size={16} />
            <span className="hidden md:inline">LinkedIn</span>
          </Link>
          <Link
            href="mailto:hoangson091104@gmail.com"
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            <Mail size={16} />
            <span className="hidden md:inline">Email</span>
          </Link>
          <Link
            href="https://sonnguyenhoang.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            <Globe size={16} />
            <span className="hidden md:inline">Website</span>
          </Link>
        </div>
      </div>
    </motion.footer>
  );
}
