import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Collabify</title>
        <meta
          name="description"
          content="The page you are looking for does not exist."
        />
      </Head>
      <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <motion.h1
            className="text-7xl md:text-9xl font-extrabold bg-gradient-to-r from-pink-600 via-red-600 to-yellow-400 bg-clip-text text-transparent animate-gradient"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            404
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-2xl md:text-3xl mt-4 font-semibold"
          >
            Oops! Page Not Found.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            The page you are looking for doesn&apos;t exist.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8"
          >
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Go Home
            </Link>
          </motion.div>
        </motion.div>
        <style jsx global>{`
          @keyframes gradient-x {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient-x 5s ease infinite;
          }
        `}</style>
      </div>
    </>
  );
}
