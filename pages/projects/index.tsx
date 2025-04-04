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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ProjectsPage({ userSub, projects }: ProjectsPageProps) {
  const [localProjects, setLocalProjects] = useState(projects);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const router = useRouter();

  async function handleCreateProject(formData: FormData) {
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim();

    if (!name) return toast.error("Project name is required");

    try {
      // Create project first
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Project creation failed");
      const project = await res.json();

      // Call join endpoint to automatically join the created project
      const joinRes = await fetch(`/api/projects/${project.projectId}/join`, {
        method: "POST",
      });
      if (!joinRes.ok) throw new Error("Failed to join project");

      setLocalProjects((prev) => [...prev, project]);
      toast.success("Project created and joined!");
      setCreateDialogOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Could not create and join project");
    }
  }

  async function handleJoinProject(formData: FormData) {
    const id = formData.get("projectId")?.toString().trim();
    if (!id) return toast.error("Project ID required");

    try {
      const res = await fetch(`/api/projects/${id}/join`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();

      toast.success("Joined project!");
      setJoinDialogOpen(false);
      // Directly redirect to the project details page using the provided id
      router.push(`/projects/${id}`);
    } catch {
      toast.error("Could not join project. Maybe already joined?");
    }
  }

  return (
    <>
      <Head>
        <title>Collabify | Your Projects</title>
        <meta
          name="description"
          content="Manage your projects – join, create, and track all your collaborative projects with Collabify."
        />
      </Head>
      <motion.div
        className="max-w-4xl mx-auto py-10 space-y-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Title and Buttons Side by Side */}
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Your Projects</h1>
          <div className="flex gap-4">
            <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="hover:scale-102 transition-transform cursor-pointer"
                >
                  Join Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Project</DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleJoinProject(new FormData(e.currentTarget));
                  }}
                >
                  <Label htmlFor="projectId">Project ID</Label>
                  <Input name="projectId" placeholder="Paste project ID..." />
                  <Button
                    type="submit"
                    className="w-full hover:scale-102 transition-transform cursor-pointer"
                  >
                    Join
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="hover:scale-102 transition-transform cursor-pointer">
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateProject(new FormData(e.currentTarget));
                  }}
                >
                  <Label htmlFor="name">Project Name</Label>
                  <Input name="name" placeholder="Project name..." required />
                  <Label htmlFor="description">Description</Label>
                  <Input
                    name="description"
                    placeholder="Optional description..."
                  />
                  <Button
                    type="submit"
                    className="w-full hover:scale-101 transition-transform cursor-pointer"
                  >
                    Create
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {localProjects.length === 0 ? (
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            You haven’t joined or created any projects yet.
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
                    <h2 className="text-xl font-semibold text-card-foreground">
                      {p.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {p.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-muted-foreground">
            {localProjects.length > 0 &&
              "Click on a project to view its details."}
          </p>
        </motion.div>
      </motion.div>
    </>
  );
}

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
