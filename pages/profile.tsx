// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useUser } from "@auth0/nextjs-auth0/client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Define item variants with a subtle pop effect.
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

// A container variant to stagger children.
const staggerContainerVariants = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function ProfilePageInternal() {
  const { user, error, isLoading } = useUser();
  const { t } = useTranslation("profile");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  // Local cache state for the user profile.
  const [localProfile, setLocalProfile] = useState(user);

  // For editing profile
  const [name, setName] = useState(user?.name || "");
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [updateLoading, setUpdateLoading] = useState(false);

  // For roles
  const [roles, setRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Separate loading state for resending verification email.
  const [resendLoading, setResendLoading] = useState(false);

  // Dialog open states.
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
  const [resendVerificationDialogOpen, setResendVerificationDialogOpen] =
    useState(false);

  // Update local profile cache when Auth0's user changes.
  useEffect(() => {
    if (user) {
      setLocalProfile(user);
      setName(user.name);
      setNickname(user.nickname);
    }
  }, [user]);

  // Fetch additional roles.
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

  // Handler to update profile.
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const res = await fetch("/api/users/updateProfile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nickname }),
      });
      if (!res.ok) {
        throw new Error("Failed to update profile");
      }
      // Update local profile cache.
      setLocalProfile({ ...localProfile, name, nickname });
      toast.success(t("updateSuccess", "Profile updated successfully"));
      setEditProfileDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(t("updateError", "Error updating profile"));
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handler to resend verification email.
  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const res = await fetch("/api/users/resendVerification", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to send verification email");
      }
      toast.success(
        t("verificationEmailSent", "Verification email sent successfully"),
      );
      setResendVerificationDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(
        t("verificationEmailError", "Error sending verification email"),
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-white" />
      </div>
    );
  if (error)
    return (
      <div className="bg-none min-h-screen flex items-center justify-center px-4 py-8 font-sans">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-base"
        >
          {error.message}
        </motion.p>
      </div>
    );
  if (!user)
    return (
      <div className="bg-none min-h-screen flex items-center justify-center px-4 py-8 font-sans">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-base text-center"
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
      <div className="bg-none min-h-screen text-white font-sans container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-3xl font-bold mb-10 text-center tracking-wide"
        >
          {t("header")}
        </motion.h1>

        {/* Profile Card with Reduced Slide-Down Effect & Hover Effects */}
        <motion.div
          className="max-w-2xl mx-auto bg-none p-10 rounded-md border-2 border-white shadow-2xl mb-10 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
        >
          <motion.div
            className="flex items-center gap-8 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.6 } }}
          >
            {localProfile?.picture && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="shrink-0 transition-transform duration-300"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src={localProfile.picture} alt="User Avatar" />
                  <AvatarFallback>{localProfile.name?.[0]}</AvatarFallback>
                </Avatar>
              </motion.div>
            )}
            {/* Staggered Text Container */}
            <motion.div
              className="flex-1 space-y-2"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.p
                variants={itemVariants}
                className="text-2xl font-semibold truncate"
              >
                {localProfile?.name}
              </motion.p>
              {localProfile?.nickname && (
                <motion.p
                  variants={itemVariants}
                  className="text-base text-white truncate"
                >
                  <span className="font-semibold">{t("nickname")}:</span>{" "}
                  {localProfile.nickname}
                </motion.p>
              )}
              {localProfile?.given_name && localProfile?.family_name && (
                <motion.p
                  variants={itemVariants}
                  className="text-base text-white truncate"
                >
                  <span className="font-semibold">{t("fullName")}:</span>{" "}
                  {localProfile.given_name} {localProfile.family_name}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
          <motion.div
            className="space-y-4 sm:space-y-6"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={itemVariants}
              className="text-base text-white truncate"
            >
              <span className="font-semibold">{t("email")}:</span>{" "}
              {localProfile?.email}
            </motion.p>
            {typeof localProfile?.email_verified === "boolean" && (
              <motion.p
                variants={itemVariants}
                className="text-base text-white truncate"
              >
                <span className="font-semibold">{t("emailVerified")}:</span>{" "}
                {localProfile.email_verified ? t("yes") : t("no")}
              </motion.p>
            )}
            {localProfile?.updated_at && (
              <motion.p
                variants={itemVariants}
                className="text-base text-white truncate"
              >
                <span className="font-semibold">{t("profileUpdated")}:</span>{" "}
                {new Date(localProfile.updated_at).toLocaleString()}
              </motion.p>
            )}
            {localProfile?.locale && (
              <motion.p
                variants={itemVariants}
                className="text-base text-white truncate"
              >
                <span className="font-semibold">{t("locale")}:</span>{" "}
                {localProfile.locale}
              </motion.p>
            )}
            <motion.div
              variants={itemVariants}
              className="text-base text-white truncate"
            >
              <span className="font-semibold">{t("rolesLabel")}:</span>{" "}
              {loadingRoles
                ? t("loadingRoles")
                : roles.length > 0
                  ? roles.join(", ")
                  : t("none")}
            </motion.div>
            {localProfile &&
              localProfile["https://myapp.example.com/roles"] && (
                <motion.p
                  variants={itemVariants}
                  className="text-base text-white truncate"
                >
                  <span className="font-semibold">
                    {t("customRolesLabel")}:
                  </span>{" "}
                  {(
                    localProfile["https://myapp.example.com/roles"] as string[]
                  ).join(", ")}
                </motion.p>
              )}
          </motion.div>
        </motion.div>

        {/* Action Buttons with Slide-Down Animation */}
        <motion.div
          className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-8 justify-center mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
        >
          {/* Edit Profile Dialog */}
          <Dialog
            open={editProfileDialogOpen}
            onOpenChange={setEditProfileDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                {t("editProfile")}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-none p-8 rounded-md border-2 border-white shadow-2xl">
              <DialogHeader>
                <DialogTitle>{t("editProfile")}</DialogTitle>
                <DialogDescription>
                  {t(
                    "updateProfileInfo",
                    "Update your profile information below.",
                  )}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="mb-2">
                    {t("name")}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-none text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="nickname" className="mb-2">
                    {t("nickname")}
                  </Label>
                  <Input
                    id="nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="bg-none text-white"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditProfileDialogOpen(false)}
                    className="hover:scale-105 transition-transform duration-300 cursor-pointer"
                  >
                    {t("cancel", "Cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateLoading}
                    className="hover:scale-105 transition-transform duration-300 cursor-pointer"
                  >
                    {updateLoading ? t("pleaseWait") : t("updateProfile")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Resend Verification Dialog */}
          <Dialog
            open={resendVerificationDialogOpen}
            onOpenChange={setResendVerificationDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                {t("verifyEmail")}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-none p-8 rounded-md border-2 border-white shadow-2xl">
              <DialogHeader>
                <DialogTitle>{t("verifyEmail")}</DialogTitle>
                <DialogDescription>
                  {t(
                    "resendVerifyDesc",
                    "Are you sure you want to resend the verification email?",
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResendVerificationDialogOpen(false)}
                  className="hover:scale-105 transition-transform duration-300 cursor-pointer"
                >
                  {t("cancel", "Cancel")}
                </Button>
                <Button
                  type="button"
                  disabled={resendLoading}
                  onClick={handleResendVerification}
                  className="hover:scale-105 transition-transform duration-300 cursor-pointer"
                >
                  {resendLoading ? t("pleaseWait") : t("resendVerification")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(ProfilePageInternal), {
  ssr: false,
});
