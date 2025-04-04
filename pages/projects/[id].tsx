import { getSession } from "@auth0/nextjs-auth0";
import { GetServerSideProps } from "next";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { roles } from "@/lib/roles";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ProjectType } from "@/types";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { nanoid } from "nanoid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  ClipboardCopy,
  Plus,
  LogOut,
  LogIn,
  Users,
  CircleCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import Head from "next/head";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

type Props = {
  userSub: string | null;
  isAdmin: boolean;
  project: ProjectType | null;
};

export default function ProjectDetailPage({
  userSub,
  isAdmin,
  project,
}: Props) {
  const router = useRouter();
  const [localProject, setLocalProject] = useState(project);
  const [newTask, setNewTask] = useState("");
  const [assignee, setAssignee] = useState("");
  const [open, setOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  const [memberInfo, setMemberInfo] = useState<
    Record<string, { name?: string; email?: string }>
  >({});

  // Animate container and cards using Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    async function fetchInfo() {
      const results: Record<string, { name?: string; email?: string }> = {};
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        localProject.members.map(async (sub) => {
          try {
            const res = await fetch(
              `/api/auth/me?user=${encodeURIComponent(sub)}`,
            );
            const json = await res.json();
            results[sub] = { name: json.name, email: json.email };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            results[sub] = {};
          }
        }),
      );
      setMemberInfo(results);
    }

    if (localProject && localProject.members) {
      fetchInfo();
    }
  }, [localProject?.members]);

  if (!userSub || !localProject)
    return <p className="text-white">Please log in or invalid project.</p>;

  const isMember = localProject.members.includes(userSub) || isAdmin;

  const handleJoin = async () => {
    const res = await fetch(`/api/projects/${localProject.projectId}/join`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success("Joined project");
      router.replace(router.asPath);
    }
  };

  const handleLeave = async () => {
    const res = await fetch(`/api/projects/${localProject.projectId}/leave`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success("Left project");
      router.replace(router.asPath);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = nanoid();
    const res = await fetch(`/api/projects/${localProject.projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id, title: newTask, assignedTo: assignee }),
    });
    if (res.ok) {
      const updated = await res.json();
      setLocalProject(updated);
      setNewTask("");
      setAssignee("");
      setOpen(false);
      toast.success("Task added");
    } else {
      toast.error("Task creation failed");
    }
  };

  const handleToggleStatus = async (taskId: string) => {
    const res = await fetch(
      `/api/projects/${localProject.projectId}/tasks/${taskId}/toggle`,
      { method: "PATCH" },
    );
    if (res.ok) {
      const updated = await res.json();
      setLocalProject(updated);
    }
  };

  const statusCounts = { todo: 0, "in-progress": 0, done: 0 };
  localProject.tasks.forEach((t) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });

  const chartOptions = {
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      tooltip: { bodyColor: "#ffffff", titleColor: "#ffffff" },
    },
    scales: {
      x: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  const barData = {
    labels: ["To Do", "In Progress", "Done"],
    datasets: [
      {
        label: "Tasks",
        data: [
          statusCounts.todo,
          statusCounts["in-progress"],
          statusCounts.done,
        ],
        backgroundColor: ["#6b7280", "#facc15", "#10b981"],
      },
    ],
  };

  const pieData = {
    labels: ["To Do", "In Progress", "Done"],
    datasets: [
      {
        data: [
          statusCounts.todo,
          statusCounts["in-progress"],
          statusCounts.done,
        ],
        backgroundColor: ["#6b7280", "#facc15", "#10b981"],
      },
    ],
  };

  return (
    <>
      <Head>
        <title>Collabify | Project Details</title>
        <meta
          name="description"
          content="Manage system-wide settings, user roles, and view system logs with Collabify."
        />
      </Head>
      <div className="text-white font-sans space-y-6 p-6">
        {/* Header Section */}
        <motion.div
          className="flex flex-wrap gap-3 items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold">{localProject.name}</h1>
          <span className="text-gray-400">{localProject.description}</span>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-4 flex-wrap"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {isMember ? (
            <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="cursor-pointer">
                  <LogOut className="h-4 w-4" /> Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border border-white text-white">
                <DialogHeader>
                  <DialogTitle>Confirm Leave</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to leave this project?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleLeave();
                      setLeaveDialogOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    Yes, Leave
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLeaveDialogOpen(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button className="cursor-pointer" onClick={handleJoin}>
              <LogIn className="h-4 w-4" /> Join
            </Button>
          )}

          {isMember && (
            <>
              {/* Add Task Modal */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="cursor-pointer">
                    <Plus className="h-4 w-4" /> New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border border-white text-white">
                  <DialogHeader>
                    <DialogTitle>Add a Task</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddTask} className="space-y-4">
                    <div>
                      <Label className="mb-2">Task Title</Label>
                      <Input
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        required
                        className="bg-black text-white border border-white"
                      />
                    </div>
                    <div>
                      <Label className="mb-2">Assign To</Label>
                      <Select onValueChange={(v) => setAssignee(v)}>
                        <SelectTrigger className="bg-black text-white border border-white">
                          <SelectValue placeholder="Select member (optional)" />
                        </SelectTrigger>
                        <SelectContent className="bg-black text-white border border-white">
                          {localProject.members.map((sub) => {
                            const info = memberInfo[sub];
                            const label = info?.name || info?.email || sub;
                            return (
                              <SelectItem key={sub} value={sub}>
                                {label}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full cursor-pointer">
                      Create
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Invite Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="cursor-pointer">
                    <Users className="h-4 w-4" /> Invite
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border border-white text-white">
                  <DialogHeader>
                    <DialogTitle>Share this Project ID</DialogTitle>
                    <DialogDescription>
                      Share this ID with your teammates to invite them to this
                      project.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    value={localProject.projectId}
                    readOnly
                    className="bg-black border border-white text-white"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(localProject.projectId);
                      toast.success("Copied ID");
                    }}
                    className="cursor-pointer"
                  >
                    <ClipboardCopy className="h-4 w-4" /> Copy
                  </Button>
                </DialogContent>
              </Dialog>
            </>
          )}
        </motion.div>

        {isMember && (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Bar Chart with Title */}
              <motion.div
                variants={cardVariants}
                className="bg-black border border-white p-4 rounded shadow transition-transform duration-300 hover:scale-101"
              >
                <h2 className="text-lg font-semibold mb-4 text-white">
                  Task Progress Overview
                </h2>
                <Bar data={barData} options={chartOptions} />
              </motion.div>

              {/* Pie Chart with Title */}
              <motion.div
                variants={cardVariants}
                className="bg-black border border-white p-4 rounded shadow transition-transform duration-300 hover:scale-101"
              >
                <h2 className="text-lg font-semibold mb-4 text-white">
                  Task Status Distribution
                </h2>
                <Pie data={pieData} options={chartOptions} />
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-black border border-white p-4 rounded shadow transition-transform duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Tasks</h2>
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-gray-300">
                  <tr>
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Assignee</th>
                    <th className="text-left p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {localProject.tasks.map((task) => (
                    <tr key={task._id} className="border-t border-gray-700">
                      <td className="p-2 text-white">{task.title}</td>
                      <td className="p-2 capitalize text-white">
                        {task.status}
                      </td>
                      <td className="p-2 text-xs text-white">
                        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                        {/* @ts-ignore */}
                        {task.assignedTo
                          ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            memberInfo[task.assignedTo]?.name ||
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            memberInfo[task.assignedTo]?.email ||
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            task.assignedTo
                          : "-"}
                      </td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(task._id)}
                          className="text-white border-white cursor-pointer"
                        >
                          <CircleCheck className="mr-2 h-4 w-4" /> Toggle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </>
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  const session = await getSession(req, res);
  const userSub = session?.user?.sub ?? null;
  const userRoles: string[] =
    session?.user?.["http://myapp.example.com/roles"] || [];
  const isAdmin = userRoles.includes(roles.admin);

  await dbConnect();
  const projectId = params?.id;
  if (!projectId) return { props: { userSub, isAdmin, project: null } };

  const found = await Project.findOne({ projectId });
  if (!found) return { props: { userSub, isAdmin, project: null } };

  const serialized: ProjectType = {
    _id: found._id.toString(),
    projectId: found.projectId,
    name: found.name,
    description: found.description,
    members: found.members,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasks: found.tasks.map((t: any) => ({
      _id: t._id.toString(),
      title: t.title,
      status: t.status,
      assignedTo: t.assignedTo || null,
    })),
  };

  if (!found.members.includes(userSub) && !isAdmin) {
    serialized.tasks = [];
  }

  return { props: { userSub, isAdmin, project: serialized } };
};
