import { motion } from "framer-motion";

export default function Test() {
  return (
    <div className="min-h-screen bg-brandPurple text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          Tailwind is working 🎉
        </h1>
        <p className="text-lg text-white/80">
          You&apos;re all set. Style away with Tailwind and build something
          cool!
        </p>
      </motion.div>
    </div>
  );
}
