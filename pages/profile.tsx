import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";

// (1) Import react-i18next and dynamic
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";

function ProfilePageInternal() {
  const { user, error, isLoading } = useUser();
  const { t } = useTranslation("profile");
  const [roles, setRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    async function fetchRoles() {
      if (user?.sub) {
        try {
          const res = await fetch(
            `/api/users/roles?sub=${encodeURIComponent(user.sub)}`,
          );
          if (!res.ok) {
            throw new Error("Failed to fetch roles");
          }
          const data = await res.json();
          setRoles(data.roles || []);
        } catch (err) {
          console.error("Error fetching roles:", err);
          setRoles([]);
        } finally {
          setLoadingRoles(false);
        }
      } else {
        setLoadingRoles(false);
      }
    }
    fetchRoles();
  }, [user]);

  if (isLoading)
    return (
      <div className="bg-black min-h-screen flex items-center justify-center p-6 font-sans">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white"
        >
          {t("loading")}
        </motion.p>
      </div>
    );
  if (error)
    return (
      <div className="bg-black min-h-screen flex items-center justify-center p-6 font-sans">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white"
        >
          {error.message}
        </motion.p>
      </div>
    );
  if (!user)
    return (
      <div className="bg-black min-h-screen flex items-center justify-center p-6 font-sans">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white"
        >
          {t("pleaseLogIn")}
        </motion.p>
      </div>
    );

  return (
    <>
      <Head>
        <title>{t("pageTitle")}</title>
        <meta name="description" content={t("metaDesc")} />
      </Head>
      <div className="bg-black min-h-screen text-white p-6 font-sans">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold mb-6 text-center"
        >
          {t("header")}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-black border border-white p-6 rounded-md max-w-lg mx-auto shadow-lg hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="flex items-center gap-6">
            {user.picture && (
              <motion.div whileHover={{ scale: 1.05 }} className="shrink-0">
                <Image
                  src={user.picture}
                  alt="User Avatar"
                  width={100}
                  height={100}
                  className="rounded-full border border-white"
                />
              </motion.div>
            )}
            <div className="space-y-2">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-semibold"
              >
                {user.name}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400"
              >
                {user.email}
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm"
              >
                <span className="font-semibold">{t("rolesLabel")}</span>{" "}
                {loadingRoles
                  ? t("loadingRoles")
                  : roles.length > 0
                    ? roles.join(", ")
                    : t("none")}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// (2) Export a client-only version to prevent SSR/hydration issues
export default dynamic(() => Promise.resolve(ProfilePageInternal), {
  ssr: false,
});
