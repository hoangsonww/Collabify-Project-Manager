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
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer p-3 rounded-full shadow-xl bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
        >
          <ArrowUp className="h-6 w-6 text-white" />
        </Button>
      )}
    </motion.div>
  );
}

export default BackToTop;
