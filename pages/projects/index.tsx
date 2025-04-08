import { useRouter } from "next/router";
import { toast } from "sonner";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Head from "next/head";

// (1) Import react-i18next + dynamic
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// Local types – note: we're using the new schema (membership is stored in the project)
type ProjectType = {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  // membership is available but not used on the client listing
  membership?: { userSub: string; role: "manager" | "editor" | "viewer" }[];
};

function ProjectsPageInternal() {
  // Local state for projects and loading indicator
  const [localProjects, setLocalProjects] = useState<ProjectType[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // loading state for CREATE
  const [isJoining, setIsJoining] = useState(false); // loading state for JOIN

  const router = useRouter();
  const { t } = useTranslation("projects");

  // -------- Fetch Projects on Client Side --------
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setLocalProjects(data.projects);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error(t("couldNotFetchProjects"));
      } finally {
        setIsLoadingProjects(false);
      }
    }
    fetchProjects();
  }, [t]);

  // -------- Create Project --------
  async function handleCreateProject(formData: FormData) {
    if (isSubmitting) return;

    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim();

    if (!name) {
      return toast.error(t("projectNameRequired"));
    }

    setIsSubmitting(true);

    try {
      // 1. Create project – API auto-assigns creator as manager
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Project creation failed");

      const project = await res.json();
      // No need to join since creator is already manager.
      setLocalProjects((prev) => [...prev, project]);
      toast.success(t("projectCreatedJoined"));
      setCreateDialogOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(t("couldNotCreateJoin"));
    } finally {
      setIsSubmitting(false);
    }
  }

  // -------- Join Project --------
  async function handleJoinProject(formData: FormData) {
    if (isJoining) return;

    const id = formData.get("projectId")?.toString().trim();
    if (!id) return toast.error(t("projectIdLabel"));

    setIsJoining(true);

    try {
      const res = await fetch(`/api/projects/${id}/join`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success(t("joinedProject"));
      setJoinDialogOpen(false);
      router.push(`/projects/${id}`);
    } catch {
      toast.error(t("couldNotJoin"));
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <>
      <Head>
        <title>Collabify | {t("title")}</title>
        <meta
          name="description"
          content={t("metaDesc") || "Manage your projects with Collabify."}
        />
      </Head>
      {isLoadingProjects ? (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin h-12 w-12 text-white" />
        </div>
      ) : (
        <motion.div
          className="max-w-4xl mx-auto py-10 space-y-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
            <div className="flex gap-4">
              {/* Join Project Dialog */}
              <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    className="hover:scale-102 transition-transform cursor-pointer"
                  >
                    {t("joinProject")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("joinProject")}</DialogTitle>
                  </DialogHeader>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleJoinProject(new FormData(e.currentTarget));
                    }}
                  >
                    <Label htmlFor="projectId">{t("projectIdLabel")}</Label>
                    <Input
                      name="projectId"
                      placeholder={t("pasteProjectId") || ""}
                    />
                    <Button
                      type="submit"
                      className="w-full hover:scale-102 transition-transform cursor-pointer"
                      disabled={isJoining}
                    >
                      {isJoining ? t("pleaseWait") : t("submitJoin")}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Create Project Dialog */}
              <Dialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="hover:scale-102 transition-transform cursor-pointer">
                    {t("createProject")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("createNewProject")}</DialogTitle>
                  </DialogHeader>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCreateProject(new FormData(e.currentTarget));
                    }}
                  >
                    <Label htmlFor="name">{t("projectName")}</Label>
                    <Input
                      name="name"
                      placeholder={t("projectNamePlaceholder") || ""}
                      required
                    />
                    <Label htmlFor="description">
                      {t("projectDescriptionPlaceholder")}
                    </Label>
                    <Input
                      name="description"
                      placeholder={t("projectDescriptionPlaceholder") || ""}
                    />
                    <Button
                      type="submit"
                      className="w-full hover:scale-101 transition-transform cursor-pointer"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t("pleaseWait") : t("submitCreate")}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* List of Projects */}
          {localProjects.length === 0 ? (
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {t("noProjectsYet")}
            </motion.p>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {localProjects.map((p) => (
                <motion.div
                  key={p.projectId}
                  variants={cardVariants}
                  className="cursor-pointer"
                  whileHover={{
                    scale: 1.01,
                    transition: { type: "spring", stiffness: 300, damping: 20 },
                  }}
                  onClick={() => router.push(`/projects/${p.projectId}`)}
                >
                  <Card className="transition-shadow hover:shadow-lg border border-border bg-card">
                    <CardContent className="p-5">
                      <h2 className="text-xl font-semibold text-card-foreground truncate">
                        {p.name}
                      </h2>
                      <p className="text-sm text-muted-foreground truncate">
                        {p.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-muted-foreground">
              {localProjects.length > 0 && t("clickToViewDetails")}
            </p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

// Export a dynamic, client-only version to avoid SSR mismatches.
export default dynamic(() => Promise.resolve(ProjectsPageInternal), {
  ssr: false,
});
