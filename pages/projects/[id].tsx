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
  Edit,
  Trash,
} from "lucide-react";
import { motion } from "framer-motion";
import Head from "next/head";

// (1) Import react-i18next + dynamic
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

function ProjectDetailPageInternal({
  userSub,
  isAdmin,
  project,
}: {
  userSub: string | null;
  isAdmin: boolean;
  project: ProjectType | null;
}) {
  const router = useRouter();
  const { t } = useTranslation("projectDetail");

  const [localProject, setLocalProject] = useState(project);
  const [newTask, setNewTask] = useState("");
  const [assignee, setAssignee] = useState("");
  const [open, setOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // State for editing a task
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitleEdit, setTaskTitleEdit] = useState("");
  const [taskAssigneeEdit, setTaskAssigneeEdit] = useState("");

  const [projectMembers, setProjectMembers] = useState<
    { sub: string; name?: string; email?: string }[]
  >([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [memberInfo, setMemberInfo] = useState<
    Record<string, { name?: string; email?: string }>
  >({});

  // Additional states for requests
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  // New states for the spinners
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // ---------- Charts Animations -----------
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // ---------- Fetch Project Members -----------
  useEffect(() => {
    async function fetchMemberDetails() {
      if (!localProject) return;
      try {
        const res = await fetch(
          `/api/projects/${localProject.projectId}/members`,
        );
        if (!res.ok) throw new Error("Failed to fetch project members");
        const data = await res.json();
        const memberIds: string[] = data.members || [];
        console.log("Project member IDs:", memberIds);

        // Fetch user details for each member ID
        const memberDetailsPromises = memberIds.map(async (memberId) => {
          const userRes = await fetch(`/api/users/info?user=${memberId}`);
          if (!userRes.ok)
            throw new Error(`Failed to fetch info for ${memberId}`);
          const memberData = await userRes.json();
          return { sub: memberId, ...memberData };
        });

        const memberDetails = await Promise.all(memberDetailsPromises);
        console.log("Member details:", memberDetails);
        setProjectMembers(memberDetails);
      } catch (error) {
        console.error(
          "Error fetching project members or member details:",
          error,
        );
      }
    }
    if (localProject) {
      fetchMemberDetails();
    }
  }, [localProject?.projectId]);

  if (!userSub || !localProject) {
    return <p className="text-white">{t("invalidProjectOrLogin")}</p>;
  }

  const isMember = localProject.members.includes(userSub) || isAdmin;

  // -------------- Join / Leave -------------
  const handleJoin = async () => {
    if (isJoining) return;
    setIsJoining(true);

    const res = await fetch(`/api/projects/${localProject.projectId}/join`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success(t("joinedProject"));
      setLocalProject((prevProject) => {
        if (!prevProject) return prevProject;
        if (prevProject.members.includes(userSub)) return prevProject;
        return { ...prevProject, members: [...prevProject.members, userSub] };
      });
    } else {
      toast.error(t("errorJoiningProject"));
    }

    setIsJoining(false);
  };

  const handleLeave = async () => {
    if (isLeaving) return;
    setIsLeaving(true);

    const res = await fetch(`/api/projects/${localProject.projectId}/leave`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success(t("leftProject"));
      // Redirect to the projects index page
      router.push("/projects");
    } else {
      toast.error(t("errorLeavingProject"));
    }

    setIsLeaving(false);
  };

  // ------------- Create Task ----------------
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingTask) return;
    setIsAddingTask(true);

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
      toast.success(t("taskAdded"));
    } else {
      toast.error(t("taskCreationFailed"));
    }

    setIsAddingTask(false);
  };

  // ------------- Toggle Task Status -----------
  const handleToggleStatus = async (taskId: string) => {
    if (togglingTaskId === taskId) return;
    setTogglingTaskId(taskId);

    const res = await fetch(
      `/api/projects/${localProject.projectId}/tasks/${taskId}/toggle`,
      {
        method: "PATCH",
      },
    );
    if (res.ok) {
      const updated = await res.json();
      setLocalProject(updated);
    }

    setTogglingTaskId(null);
  };

  // ------------- Delete Task -------------
  const openDeleteDialog = (taskId: string, title: string) => {
    setTaskToDelete({ id: taskId, title });
    setDeleteDialogOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    setIsDeletingTask(true); // Show spinner

    const { id: taskId } = taskToDelete;
    const res = await fetch(
      `/api/projects/${localProject.projectId}/tasks/${taskId}`,
      {
        method: "DELETE",
      },
    );
    if (res.ok) {
      const updatedProject = await res.json();
      setLocalProject(updatedProject);
      toast.success(t("taskDeleted"));
    } else {
      toast.error(t("errorDeletingTask"));
    }

    setDeleteDialogOpen(false);
    setTaskToDelete(null);

    setIsDeletingTask(false);
  };

  // ------------- Edit Task -------------
  const openEditDialog = (
    taskId: string,
    currentTitle: string,
    currentAssignee: string | null,
  ) => {
    setEditingTaskId(taskId);
    setTaskTitleEdit(currentTitle);
    setTaskAssigneeEdit(currentAssignee ?? "");
    setEditDialogOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId) return;

    setIsSavingTask(true); // Show spinner

    const res = await fetch(
      `/api/projects/${localProject.projectId}/tasks/${editingTaskId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitleEdit,
          assignedTo: taskAssigneeEdit || null,
        }),
      },
    );

    if (res.ok) {
      const updatedProject = await res.json();
      setLocalProject(updatedProject);
      toast.success(t("taskUpdated"));
      setEditDialogOpen(false);
      setEditingTaskId(null);
      setTaskTitleEdit("");
      setTaskAssigneeEdit("");
    } else {
      toast.error(t("errorUpdatingTask"));
    }

    setIsSavingTask(false);
  };

  // ------------- Chart Data -------------
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
    labels: [t("toDo"), t("inProgress"), t("done")],
    datasets: [
      {
        label: t("tasksLabel"),
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
    labels: [t("toDo"), t("inProgress"), t("done")],
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

  // ------------- Rendering -------------
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
          <h1 className="text-3xl font-bold truncate">{localProject.name}</h1>
          <span className="text-gray-400 truncate">
            {localProject.description}
          </span>
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
                  {isLeaving ? (
                    // A simple spinner, or replace with your own spinner component
                    <div className="loader" aria-label="Loading..." />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  &nbsp;{t("btnLeave")}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-none border border-white text-white">
                <DialogHeader>
                  <DialogTitle>{t("confirmLeaveTitle")}</DialogTitle>
                  <DialogDescription>{t("confirmLeaveDesc")}</DialogDescription>
                </DialogHeader>
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleLeave();
                      setLeaveDialogOpen(false);
                    }}
                    disabled={isLeaving}
                    className="cursor-pointer"
                  >
                    {isLeaving ? t("pleaseWait") : t("yesLeave")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLeaveDialogOpen(false)}
                    disabled={isLeaving}
                    className="cursor-pointer"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              className="cursor-pointer"
              onClick={handleJoin}
              disabled={isJoining}
            >
              {isJoining ? t("pleaseWait") : <LogIn className="h-4 w-4" />}
              &nbsp;{t("btnJoin")}
            </Button>
          )}

          {isMember && (
            <>
              {/* Add Task Modal */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="cursor-pointer">
                    {isAddingTask ? (
                      <div className="loader" aria-label="Loading..." />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    &nbsp;{t("btnNewTask")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-none border border-white text-white">
                  <DialogHeader>
                    <DialogTitle>{t("addTaskModalTitle")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddTask} className="space-y-4">
                    <div>
                      <Label className="mb-2">{t("taskTitleLabel")}</Label>
                      <Input
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        required
                        className="bg-none text-white border border-white"
                      />
                    </div>
                    <div>
                      <Label className="mb-2">{t("assignToLabel")}</Label>
                      <Select onValueChange={(v) => setAssignee(v)}>
                        <SelectTrigger className="bg-none text-white border border-white">
                          <SelectValue
                            placeholder={t("selectMemberOptional") || ""}
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-none text-white border border-white">
                          {projectMembers.map((member) => {
                            const label =
                              member.name || member.email || member.sub;
                            return (
                              <SelectItem
                                key={member.sub}
                                value={member.sub}
                                className="text-black"
                              >
                                {label}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      disabled={isAddingTask}
                    >
                      {isAddingTask ? t("pleaseWait") : t("createTaskBtn")}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Invite Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="cursor-pointer">
                    <Users className="h-4 w-4" /> {t("inviteBtn")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-none border border-white text-white">
                  <DialogHeader>
                    <DialogTitle>{t("inviteTitle")}</DialogTitle>
                    <DialogDescription>{t("inviteDesc")}</DialogDescription>
                  </DialogHeader>
                  <Input
                    value={localProject.projectId}
                    readOnly
                    className="bg-none border border-white text-white"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(localProject.projectId);
                      toast.success(t("copiedIdMsg"));
                    }}
                    className="cursor-pointer"
                  >
                    <ClipboardCopy className="h-4 w-4" /> {t("copyBtn")}
                  </Button>
                </DialogContent>
              </Dialog>
            </>
          )}
        </motion.div>

        {/* Main content if user is member */}
        {isMember && (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Bar Chart */}
              <motion.div
                variants={cardVariants}
                className="bg-none border border-white p-4 rounded shadow transition-transform duration-300 hover:scale-101"
              >
                <h2 className="text-lg font-semibold mb-4 text-white">
                  {t("taskProgressOverview")}
                </h2>
                <Bar data={barData} options={chartOptions} />
              </motion.div>

              {/* Pie Chart */}
              <motion.div
                variants={cardVariants}
                className="bg-none border border-white p-4 rounded shadow transition-transform duration-300 hover:scale-101"
              >
                <h2 className="text-lg font-semibold mb-4 text-white">
                  {t("taskStatusDistribution")}
                </h2>
                <Pie data={pieData} options={chartOptions} />
              </motion.div>
            </motion.div>

            {/* Task Table */}
            <motion.div
              className="bg-none border border-white p-4 rounded shadow transition-transform duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-white">
                {t("tasks")}
              </h2>
              <div className="overflow-x-auto rounded-[8px] overflow-hidden">
                <table className="min-w-[600px] w-full text-sm">
                  <thead className="bg-gray-800 text-gray-300">
                    <tr>
                      <th className="text-left p-2">{t("title")}</th>
                      <th className="text-left p-2">{t("status")}</th>
                      <th className="text-left p-2">{t("assignee")}</th>
                      <th className="text-left p-2">{t("action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localProject.tasks.map((task) => (
                      <tr key={task._id} className="border-t border-gray-700">
                        <td className="p-2 text-white">{task.title}</td>
                        <td className="p-2 capitalize text-white">
                          {t(`statuses.${task.status}`)}
                        </td>
                        <td className="p-2 text-white">
                          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                          {/* @ts-ignore */}
                          {task.assignedTo
                            ? projectMembers.find(
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                (m) => m.sub === task.assignedTo,
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                              )?.email || task.assignedTo
                            : "-"}
                        </td>
                        <td className="p-2 flex gap-2 items-center">
                          {/* Toggle Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(task._id)}
                            className="text-white border-white cursor-pointer"
                            disabled={togglingTaskId === task._id}
                          >
                            <CircleCheck className="mr-2 h-4 w-4" />
                            {t("toggle")}
                          </Button>

                          {/* Edit Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openEditDialog(
                                task._id,
                                task.title,
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                task.assignedTo,
                              )
                            }
                            className="text-white border-white cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Delete Button => opens confirm dialog */}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              openDeleteDialog(task._id, task.title)
                            }
                            className="text-white cursor-pointer"
                            disabled={isDeletingTask}
                          >
                            {isDeletingTask ? (
                              <div className="loader" aria-label="Loading..." />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}

        {/* Confirm Delete Task Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-none border border-white text-white">
            <DialogHeader>
              <DialogTitle>{t("deleteTaskConfirmTitle")}</DialogTitle>
              <DialogDescription>
                {taskToDelete
                  ? t("deleteTaskConfirmDesc", { task: taskToDelete.title })
                  : t("deleteTaskConfirmDescGeneric")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-4 mt-4">
              <Button
                variant="destructive"
                onClick={handleDeleteTask}
                className="cursor-pointer"
                disabled={isDeletingTask}
              >
                {isDeletingTask ? t("pleaseWait") : t("deleteTaskBtn")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="cursor-pointer"
                disabled={isDeletingTask}
              >
                {t("cancel")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-none border border-white text-white">
            <DialogHeader>
              <DialogTitle>{t("editTask")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <Label className="mb-2">{t("taskTitleLabel")}</Label>
                <Input
                  value={taskTitleEdit}
                  onChange={(e) => setTaskTitleEdit(e.target.value)}
                  required
                  className="bg-none text-white border border-white"
                />
              </div>
              <div>
                <Label className="mb-2">{t("assignToLabel")}</Label>
                <Select
                  value={taskAssigneeEdit || ""}
                  onValueChange={(v) => setTaskAssigneeEdit(v)}
                >
                  <SelectTrigger className="bg-none text-white border border-white">
                    <SelectValue
                      placeholder={t("selectMemberOptional") || ""}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-none text-white border border-white">
                    {projectMembers.map((member) => {
                      const label = member.name || member.email || member.sub;
                      return (
                        <SelectItem
                          key={member.sub}
                          value={member.sub}
                          className="text-black"
                        >
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isSavingTask}
              >
                {isSavingTask ? t("pleaseWait") : t("saveChanges")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

// ------------- Server-Side -------------
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

export default dynamic(() => Promise.resolve(ProjectDetailPageInternal), {
  ssr: false,
});
