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
import { Search, Loader2, Eye } from "lucide-react";

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

  // New state for searching users.
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // If a profile is selected from the search results,
  // it will override the current local profile (for display purposes).
  const [selectedProfile, setSelectedProfile] = useState(null);
  const profileToDisplay = selectedProfile || localProfile;
  const [isSearching, setIsSearching] = useState(false);

  // Update local profile cache when Auth0's user changes.
  useEffect(() => {
    if (user) {
      setLocalProfile(user);
      setName(user.name);
      setNickname(user.nickname);
    }
  }, [user]);

  console.log(user);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const res = await fetch("/api/users/updateProfile", {
            method: "GET",
          });
          if (!res.ok) {
            throw new Error("Failed to fetch profile");
          }
          const data = await res.json();
          // Update only name and nickname while preserving the rest of the profile.
          if (data.user) {
            setLocalProfile((prev) => ({
              ...prev,
              name: data.user.name,
              nickname: data.user.nickname,
            }));
            setName(data.user.name);
            setNickname(data.user.nickname);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      }
    }
    fetchProfile();
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
      const responseData = await res.json();
      // Merge updated name and nickname with existing profile.
      setLocalProfile((prev) => ({
        ...prev,
        name: responseData.user.name,
        nickname: responseData.user.nickname,
      }));
      toast.success(t("updateSuccess", "Profile updated successfully"));
      setEditProfileDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(t("updateError", "Error updating profile"));
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handler to search for users
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Immediately show the spinner when a query is entered.
    setIsSearching(true);

    const debounceHandler = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(searchQuery)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.users);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("User search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(debounceHandler);
  }, [searchQuery]);

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
        {selectedProfile ? (
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl font-bold mb-10 text-center tracking-wide flex justify-center items-center space-x-2"
          >
            <Eye className="h-6 w-6 text-white" />
            <span>{t("viewingProfile", { name: selectedProfile.name })}</span>
          </motion.h1>
        ) : (
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl font-bold mb-10 text-center tracking-wide"
          >
            {t("header")}
          </motion.h1>
        )}

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-6"
        >
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-white" />
            </span>
            <Input
              placeholder={t(
                "searchPlaceholder",
                "Search by name or nickname...",
              )}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedProfile(null);
              }}
              className="w-full pl-10 pr-10 py-2 bg-transparent text-white border border-white focus:border-blue-500 focus:outline-none rounded-md"
            />
            {isSearching && (
              <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Loader2 className="animate-spin h-5 w-5 text-white" />
              </span>
            )}
          </div>
          {searchResults.length > 0 ? (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 border border-white rounded-md p-2 max-h-60 overflow-y-auto"
            >
              {searchResults.map((usr) => (
                <motion.li
                  key={usr.userSub}
                  className="p-2 cursor-pointer text-white flex items-center space-x-3 rounded transition-colors hover:bg-white/10"
                  onClick={() => {
                    setSelectedProfile(usr);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={usr.picture} alt={usr.name} />
                    <AvatarFallback className="bg-black text-lg">
                      {usr.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {usr.name} ({usr.nickname || t("noNickname", "No nickname")}
                    )
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            // Display a message if no user is found and the query is not empty (and not currently searching)
            !isSearching &&
            searchQuery.trim() !== "" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-white text-center p-2"
              >
                {t("noUserFound", { query: searchQuery })}
              </motion.div>
            )
          )}
        </motion.div>

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
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="shrink-0 transition-transform duration-300"
            >
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-black text-white border border-white text-2xl">
                  {profileToDisplay?.name?.[0] || "?"}
                </AvatarFallback>
                <AvatarImage
                  src={profileToDisplay.picture}
                  alt="User Avatar"
                  onError={() => setImageError(true)}
                />
              </Avatar>
            </motion.div>
            {/* Staggered Text Container */}
            <motion.div
              className="flex-1 space-y-2 truncate"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.p
                variants={itemVariants}
                className="text-2xl font-semibold truncate"
              >
                {profileToDisplay?.name}
              </motion.p>
              {profileToDisplay?.nickname && (
                <motion.p
                  variants={itemVariants}
                  className="text-base text-white truncate"
                >
                  <span className="font-semibold">{t("nickname")}:</span>{" "}
                  {profileToDisplay.nickname}
                </motion.p>
              )}
              {profileToDisplay?.given_name &&
                profileToDisplay?.family_name && (
                  <motion.p
                    variants={itemVariants}
                    className="text-base text-white truncate"
                  >
                    <span className="font-semibold">{t("fullName")}:</span>{" "}
                    {profileToDisplay.given_name} {profileToDisplay.family_name}
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

          {selectedProfile && (
            <Button
              variant="default"
              className="hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => setSelectedProfile(null)}
            >
              {t("backToProfile", "Back to My Profile")}
            </Button>
          )}
        </motion.div>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(ProfilePageInternal), {
  ssr: false,
});
