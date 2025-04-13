"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down 50px
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 50);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      transition={{ duration: 0.3 }}
    >
      {isVisible && (
        <Button
          onClick={scrollToTop}
          aria-label="Back to top"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          as={motion.button}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full bg-black text-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-transform duration-200 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.7)] hover:bg-white hover:text-black cursor-pointer focus:outline-none"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
      )}
    </motion.div>
  );
}

export default BackToTop;
