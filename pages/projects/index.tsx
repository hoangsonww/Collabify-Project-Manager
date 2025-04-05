import { getSession } from "@auth0/nextjs-auth0";
import { GetServerSideProps } from "next";
import { Project } from "@/models/Project";
import { dbConnect } from "@/lib/mongodb";
import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// Local types
type ProjectType = {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  members: string[];
};

type ProjectsPageProps = {
  userSub: string;
  projects: ProjectType[];
};

// (2) The real functional component using translations
function ProjectsPageInternal({ projects }: ProjectsPageProps) {
  const [localProjects, setLocalProjects] = useState(projects);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // loading state for CREATE
  const [isJoining, setIsJoining] = useState(false); // loading state for JOIN

  const router = useRouter();

  // Use the "projects" namespace
  const { t } = useTranslation("projects");

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
      // 1. Create project
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Project creation failed");

      const project = await res.json();

      // 2. Join the newly created project
      const joinRes = await fetch(`/api/projects/${project.projectId}/join`, {
        method: "POST",
      });
      if (!joinRes.ok) throw new Error("Failed to join project");

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
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
    </>
  );
}

// (3) Server-side data fetching (unchanged)
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession(req, res);
  if (!session?.user)
    return { redirect: { destination: "/", permanent: false } };

  const userSub = session.user.sub;
  await dbConnect();
  const userProjects = await Project.find({ members: userSub });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serialized = userProjects.map((p: any) => ({
    _id: p._id.toString(),
    projectId: p.projectId,
    name: p.name,
    description: p.description,
    members: p.members,
  }));

  return { props: { userSub, projects: serialized } };
};

// (4) Export a client-only version to avoid SSR mismatch
export default dynamic(() => Promise.resolve(ProjectsPageInternal), {
  ssr: false,
});
