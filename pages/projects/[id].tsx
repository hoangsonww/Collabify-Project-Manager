import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
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
import { DatePicker } from "@/components/ui/date-picker";
import { CustomTimePicker } from "@/components/ui/time-picker";
import { format } from "date-fns";
import { enUS, vi } from "date-fns/locale";

import {
  ClipboardCopy,
  Plus,
  LogOut,
  LogIn,
  Users,
  CircleCheck,
  Edit,
  Trash,
  Circle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import Head from "next/head";

// (1) Import react-i18next + dynamic
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import dynamic from "next/dynamic";

import { roles } from "@/lib/roles";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
);

// ============ Types ============
// Each membership entry from DB
interface IMembership {
  userSub: string; // e.g. "auth0|abc123"
  role: "manager" | "editor" | "viewer";
}

// Additional info we fetch from /api/users/info?user=...
interface IUserInfo {
  name?: string;
  email?: string;
}

interface IMembershipInfo extends IMembership {
  // Combined user info for display
  displayName: string;
}

interface ITask {
  _id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  assignedTo?: string | null;
  priority?: "low" | "medium" | "high";
}

interface IProject {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  membership?: IMembership[];
  tasks: ITask[];
}

function ProjectDetailPageInternal() {
  const router = useRouter();
  const { t, i18n } = useTranslation("projectDetail");
  const currentLocale = i18n.language === "vi" ? vi : enUS;

  // Use Auth0’s client-side hook to get user info.
  const { user, isLoading: userLoading } = useUser();
  const userSub = user?.sub || null;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userRoles: string[] = user?.["http://myapp.example.com/roles"] || [];
  const isAdmin = userRoles.includes(roles.admin);

  // Local copy of the project (for tasks)
  // Initially null, then set when the client-side fetch is complete.
  const [localProject, setLocalProject] = useState<IProject | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  // Fetch project data client side from the API endpoint.
  // This replaces the previous getServerSideProps logic.
  useEffect(() => {
    if (!router.query.id) return;
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${router.query.id}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();
        setLocalProject(data.project);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        toast.error(t("errorFetchingProject"));
      } finally {
        setIsLoadingProject(false);
      }
    };
    fetchProject();
  }, [router.query.id, t]);

  // ============= MEMBERSHIP WITH DISPLAY INFO ============
  const [memberships, setMemberships] = useState<IMembershipInfo[]>([]);
  const [membershipLoading, setMembershipLoading] = useState(true);

  // ============= Manager Role Dialogs ============
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<"manager" | "editor" | "viewer">(
    "viewer",
  );

  // ============= Project-level Dialogs (delete, etc.) ============
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // ============= Task Creation ============
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [assignee, setAssignee] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [isAddingTask, setIsAddingTask] = useState(false);

  // ============= Task Edits / Deletion ============
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitleEdit, setTaskTitleEdit] = useState("");
  const [taskAssigneeEdit, setTaskAssigneeEdit] = useState("");
  const [taskPriorityEdit, setTaskPriorityEdit] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [taskToDelete, setTaskToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [taskDueDateEdit, setTaskDueDateEdit] = useState<Date>(new Date());
  const [taskDueTimeEdit, setTaskDueTimeEdit] = useState<string>("12:00");

  // ============= Join/Leave states ============
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // ============= Toggling Task Status ============
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  // ============= Derive My Role / Is Manager ============
  const myMembership = memberships.find((m) => m.userSub === userSub);
  const isMember = !!myMembership;
  const isManager = myMembership?.role === "manager" || isAdmin;

  // ============= TIME LEFT FOR TASKS ============
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [timeLeftMap, setTimeLeftMap] = useState<Record<string, string>>({});
  const [newDueDate, setNewDueDate] = useState(new Date());
  const [newDueTime, setNewDueTime] = useState<string>("12:00");

  const getTimeLeft = (dueDate: string, t: TFunction): string => {
    const now = Date.now();
    const due = new Date(dueDate).getTime();
    const diff = due - now;
    if (diff < 0) return t("timeLeft.overdue");
    if (diff < 60000)
      return t("timeLeft.secondsLeft", { count: Math.floor(diff / 1000) });
    if (diff < 3600000)
      return t("timeLeft.minutesLeft", { count: Math.floor(diff / 60000) });
    if (diff < 86400000)
      return t("timeLeft.hoursLeft", { count: Math.floor(diff / 3600000) });
    return t("timeLeft.daysLeft", { count: Math.floor(diff / 86400000) });
  };

  useEffect(() => {
    if (!localProject || !localProject.tasks) return;
    const interval = setInterval(() => {
      const newMap: Record<string, string> = {};
      localProject.tasks.forEach((task) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (task.dueDate) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          newMap[task._id] = getTimeLeft(task.dueDate, t);
        }
      });
      setTimeLeftMap(newMap);
    }, 1000);
    return () => clearInterval(interval);
  }, [localProject]);

  // ============= Fetch Membership & user info ============
  useEffect(() => {
    if (!localProject) return;
    async function fetchMembership() {
      try {
        const resp = await fetch(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          `/api/projects/${localProject.projectId}/membership`,
        );
        if (!resp.ok) throw new Error("Failed to fetch membership");
        const data = await resp.json(); // { membership: [ {userSub, role}, ... ] }
        const membershipRaw: IMembership[] = data.membership || [];
        const userSubs = membershipRaw.map((entry) => entry.userSub);
        const userInfoResp = await fetch(
          `/api/users/infoBatch?users=${encodeURIComponent(userSubs.join(","))}`,
        );
        let usersInfo: Record<string, IUserInfo> = {};
        if (userInfoResp.ok) {
          usersInfo = await userInfoResp.json();
        }
        const membershipWithInfo = membershipRaw.map((entry) => {
          const info = usersInfo[entry.userSub] || {};
          const displayName = info.name || info.email || entry.userSub;
          return { ...entry, displayName };
        });
        setMemberships(membershipWithInfo);
      } catch (err) {
        console.error("Error fetching membership or user info:", err);
      } finally {
        setMembershipLoading(false);
      }
    }
    fetchMembership();
  }, [localProject?.projectId]);

  // ---------- CHART DATA ----------
  // Use helper variable to safely refer to tasks
  const tasks = localProject ? localProject.tasks : [];

  const statusCounts = { todo: 0, "in-progress": 0, done: 0 };
  tasks.forEach((task) => {
    statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
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

  // Chart Data – Tasks by Priority for this project
  const tasksByPriorityData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 };
    tasks.forEach((task: ITask) => {
      const prio = task.priority || "medium";
      counts[prio]++;
    });
    return {
      labels: [t("low"), t("medium"), t("high")],
      datasets: [
        {
          label: t("tasksByPriority"),
          data: [counts.low, counts.medium, counts.high],
          backgroundColor: ["#4ade80", "#facc15", "#f87171"],
        },
      ],
    };
  }, [t, tasks]);

  // Chart Data – Tasks by Assignee for this project
  const tasksByAssigneeData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((task: ITask) => {
      if (task.assignedTo) {
        counts[task.assignedTo] = (counts[task.assignedTo] || 0) + 1;
      }
    });
    const labels = Object.keys(counts).map((sub) => {
      const member = memberships.find((m) => m.userSub === sub);
      return member ? member.displayName : sub;
    });
    return {
      labels,
      datasets: [
        {
          label: t("tasksByAssignee"),
          data: Object.values(counts),
          backgroundColor: [
            "#60a5fa",
            "#facc15",
            "#4ade80",
            "#f87171",
            "#a78bfa",
          ],
        },
      ],
    };
  }, [t, tasks, memberships]);

  // Chart Data – Tasks by Due Date (Line Chart)
  const tasksByDueDateLineData = useMemo(() => {
    const groups = new Map<number, number>();
    tasks.forEach((task: ITask) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (task.dueDate) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const d = new Date(task.dueDate);
        // Normalize to the start of the day (midnight)
        d.setHours(0, 0, 0, 0);
        const ts = d.getTime();
        groups.set(ts, (groups.get(ts) || 0) + 1);
      }
    });
    // Sort the timestamps in ascending order (earlier dates first)
    const sortedTimestamps = Array.from(groups.keys()).sort((a, b) => a - b);
    const labels = sortedTimestamps.map((ts) =>
      format(new Date(ts), "PP", { locale: currentLocale }),
    );
    const data = sortedTimestamps.map((ts) => groups.get(ts) as number);
    return {
      labels,
      datasets: [
        {
          label: t("tasksByDueDateLine"),
          data,
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.4)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [t, tasks, currentLocale]);

  // Chart Data – Tasks by Due Date (Horizontal Bar Chart)
  const tasksByDueDateBarData = useMemo(() => {
    const groups = new Map<number, number>();
    tasks.forEach((task: ITask) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (task.dueDate) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const d = new Date(task.dueDate);
        // Normalize to the start of the day (midnight)
        d.setHours(0, 0, 0, 0);
        const ts = d.getTime();
        groups.set(ts, (groups.get(ts) || 0) + 1);
      }
    });
    // Sort the timestamps in ascending order (earlier dates first)
    const sortedTimestamps = Array.from(groups.keys()).sort((a, b) => a - b);
    const labels = sortedTimestamps.map((ts) =>
      format(new Date(ts), "PP", { locale: currentLocale }),
    );
    const data = sortedTimestamps.map((ts) => groups.get(ts) as number);
    return {
      labels,
      datasets: [
        {
          label: t("tasksByDueDateBar"),
          data,
          backgroundColor: "#facc15",
        },
      ],
    };
  }, [t, tasks, currentLocale]);

  // NEW: Hooks for removeMember dialog state
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  // ====================================
  //   JOIN / LEAVE / DELETE PROJECT
  // ====================================
  const handleJoin = async () => {
    if (isJoining) return;
    setIsJoining(true);
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const res = await fetch(`/api/projects/${localProject.projectId}/join`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to join");
      toast.success(t("joinedProject"));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setMemberships((old) => [
        ...old,
        { userSub, role: "editor", displayName: userSub || "You" },
      ]);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error(t("errorJoiningProject"));
    }
    setIsJoining(false);
  };

  const handleLeave = async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const res = await fetch(`/api/projects/${localProject.projectId}/leave`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success(t("leftProject"));
      router.push("/projects");
    } catch {
      toast.error(t("errorLeavingProject"));
    }
    setIsLeaving(false);
  };

  const handleDeleteProject = async () => {
    if (!isManager) return;
    setIsDeletingProject(true);
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const res = await fetch(`/api/projects/${localProject.projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete project failed");
      toast.success(t("projectDeleted"));
      router.push("/projects");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error(t("errorDeletingProject"));
    }
    setIsDeletingProject(false);
    setDeleteDialogOpen(false);
  };

  // ====================================
  //   CREATE / EDIT / DELETE TASK
  // ====================================
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingTask) return;
    if (myMembership?.role === "viewer") {
      toast.error(t("viewerCannotAddTask"));
      return;
    }
    setIsAddingTask(true);
    try {
      const taskId = nanoid();
      // Combine date and time: create a new Date object using the selected date and due time.
      const [hours, minutes] = newDueTime.split(":").map(Number);
      const combinedDueDate = new Date(newDueDate);
      combinedDueDate.setHours(hours, minutes, 0, 0);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const res = await fetch(`/api/projects/${localProject.projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: taskId,
          title: newTask,
          assignedTo: assignee || null,
          priority: newPriority,
          dueDate: combinedDueDate.toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Task creation failed");
      const updated = await res.json();
      setLocalProject(updated);
      toast.success(t("taskAdded"));
      setNewTask("");
      setAssignee("");
      setNewPriority("medium");
      setOpen(false);
    } catch {
      toast.error(t("taskCreationFailed"));
    }
    setIsAddingTask(false);
  };

  const handleToggleStatus = async (taskId: string) => {
    if (myMembership?.role === "viewer") {
      toast.error(t("viewerCannotToggleTask"));
      return;
    }
    if (togglingTaskId === taskId) return;
    setTogglingTaskId(taskId);
    try {
      const res = await fetch(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        `/api/projects/${localProject.projectId}/tasks/${taskId}/toggle`,
        { method: "PATCH" },
      );
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setLocalProject(updated);
    } catch {
      toast.error(t("errorTogglingTask"));
    }
    setTogglingTaskId(null);
  };

  const openDeleteDialogForTask = (taskId: string, title: string) => {
    setTaskToDelete({ id: taskId, title });
    setDeleteDialogOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    if (myMembership?.role === "viewer") {
      toast.error(t("viewerCannotDeleteTask"));
      return;
    }
    setIsDeletingTask(true);
    try {
      const res = await fetch(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        `/api/projects/${localProject.projectId}/tasks/${taskToDelete.id}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error();
      const updatedProject = await res.json();
      setLocalProject(updatedProject);
      toast.success(t("taskDeleted"));
    } catch {
      toast.error(t("errorDeletingTask"));
    }
    setIsDeletingTask(false);
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const openEditDialog = (
    taskId: string,
    currentTitle: string,
    currentAssignee: string | null,
    currentPriority: "low" | "medium" | "high" = "medium",
    currentDueDate?: string,
  ) => {
    if (myMembership?.role === "viewer") {
      toast.error(t("viewerCannotEditTask"));
      return;
    }
    setEditingTaskId(taskId);
    setTaskTitleEdit(currentTitle);
    setTaskAssigneeEdit(currentAssignee || "");
    setTaskPriorityEdit(currentPriority);
    if (currentDueDate) {
      const parsedDate = new Date(currentDueDate);
      setTaskDueDateEdit(parsedDate);
      const hh = parsedDate.getHours().toString().padStart(2, "0");
      const mm = parsedDate.getMinutes().toString().padStart(2, "0");
      setTaskDueTimeEdit(`${hh}:${mm}`);
    } else {
      const now = new Date();
      setTaskDueDateEdit(now);
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      setTaskDueTimeEdit(`${hh}:${mm}`);
    }
    setEditDialogOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId) return;
    setIsSavingTask(true);
    try {
      const [hours, minutes] = taskDueTimeEdit.split(":").map(Number);
      const combinedDueDate = new Date(taskDueDateEdit);
      combinedDueDate.setHours(hours, minutes, 0, 0);
      const res = await fetch(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        `/api/projects/${localProject.projectId}/tasks/${editingTaskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: taskTitleEdit,
            assignedTo: taskAssigneeEdit || null,
            priority: taskPriorityEdit,
            dueDate: combinedDueDate.toISOString(),
          }),
        },
      );
      if (!res.ok) throw new Error();
      const updatedProject = await res.json();
      setLocalProject(updatedProject);
      toast.success(t("taskUpdated"));
      setEditDialogOpen(false);
      setEditingTaskId(null);
      setTaskTitleEdit("");
      setTaskAssigneeEdit("");
      setTaskPriorityEdit("medium");
      setTaskDueDateEdit(new Date());
      setTaskDueTimeEdit("12:00");
    } catch {
      toast.error(t("errorUpdatingTask"));
    }
    setIsSavingTask(false);
  };

  // ====================================
  //   ROLE ASSIGNMENT / REMOVE MEMBERS
  // ====================================
  const handleOpenRoleDialog = (user: string, currentRole: string) => {
    setRoleUser(user);
    setNewRole(currentRole as "manager" | "editor" | "viewer");
    setRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!roleUser) return;
    if (!isManager) {
      toast.error(t("onlyManagerCanAssignRoles"));
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const res = await fetch(`/api/projects/${localProject.projectId}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserSub: roleUser, newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      toast.success(t("roleUpdated"));
      setMemberships((old) =>
        old.map((m) => (m.userSub === roleUser ? { ...m, role: newRole } : m)),
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error(t("errorUpdatingRole"));
    }
    setRoleDialogOpen(false);
  };

  const handleRemoveMember = async (memberSub: string) => {
    if (!isManager) {
      toast.error(t("onlyManagerCanRemoveMembers"));
      return;
    }
    if (memberSub === userSub) {
      toast.error(t("cannotRemoveYourself"));
      return;
    }
    try {
      const res = await fetch(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        `/api/projects/${localProject.projectId}/members/${memberSub}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error();
      toast.success(t("memberRemoved"));
      setMemberships((old) => old.filter((m) => m.userSub !== memberSub));
    } catch {
      toast.error(t("errorRemovingMember"));
    }
  };

  // ====================================
  //   RENDER (Conditional Rendering in JSX)
  // ====================================
  return (
    <>
      <Head>
        <title>Collabify | Project Details</title>
        <meta name="description" content="Manage project, tasks, roles" />
      </Head>
      <div className="text-white font-sans space-y-6 p-6">
        {userLoading || isLoadingProject ? (
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin h-12 w-12 text-white" />
          </div>
        ) : !localProject ? (
          <div className="min-h-screen flex items-center justify-center text-white">
            {t("invalidProjectOrLogin")}
          </div>
        ) : (
          <>
            {/* HEADER */}
            <motion.div
              className="flex flex-wrap gap-3 items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold truncate">
                {localProject.name}
              </h1>
              <span className="text-gray-400 truncate">
                {localProject.description}
              </span>
            </motion.div>

            {/* MANAGER-ONLY: DELETE PROJECT BUTTON */}
            {isManager && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isDeletingProject}
                  className="cursor-pointer"
                >
                  {isDeletingProject ? t("pleaseWait") : t("deleteProject")}
                </Button>
              </motion.div>
            )}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="bg-black border border-white text-white">
                <DialogHeader>
                  <DialogTitle>{t("deleteProjectConfirmTitle")}</DialogTitle>
                  <DialogDescription>
                    {t("deleteProjectConfirmDesc")}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteProject}
                    disabled={isDeletingProject}
                    className="cursor-pointer"
                  >
                    {isDeletingProject
                      ? t("pleaseWait")
                      : t("deleteProjectBtn")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={isDeletingProject}
                    className="cursor-pointer"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* ACTION BUTTONS: Join / Leave / Add Task / Invite */}
            <motion.div
              className="flex gap-4 flex-wrap"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {membershipLoading ? (
                <Button disabled>{t("loadingData")}</Button>
              ) : isMember ? (
                <Dialog
                  open={leaveDialogOpen}
                  onOpenChange={setLeaveDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="cursor-pointer">
                      {isLeaving ? (
                        <div className="loader" aria-label="Loading..." />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      &nbsp;{t("btnLeave")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black border border-white text-white">
                    <DialogHeader>
                      <DialogTitle>{t("confirmLeaveTitle")}</DialogTitle>
                      <DialogDescription>
                        {t("confirmLeaveDesc")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-4 mt-4">
                      <Button
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => {
                          handleLeave();
                          setLeaveDialogOpen(false);
                        }}
                        disabled={isLeaving}
                      >
                        {isLeaving ? t("pleaseWait") : t("yesLeave")}
                      </Button>
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => setLeaveDialogOpen(false)}
                        disabled={isLeaving}
                      >
                        {t("cancel")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="cursor-pointer"
                >
                  {isJoining ? t("pleaseWait") : <LogIn className="h-4 w-4" />}
                  &nbsp;{t("btnJoin")}
                </Button>
              )}

              {isMember && myMembership?.role !== "viewer" && (
                <>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="cursor-pointer">
                        {isAddingTask ? (
                          <div className="loader" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        &nbsp;{t("btnNewTask")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black border border-white text-white">
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
                            className="bg-black text-white border border-white"
                          />
                        </div>
                        <div>
                          <Label className="mb-2">{t("assignToLabel")}</Label>
                          <Select
                            value={assignee}
                            onValueChange={(v) => setAssignee(v)}
                          >
                            <SelectTrigger className="bg-black text-white border border-white cursor-pointer">
                              <SelectValue
                                placeholder={t("selectMemberOptional") || ""}
                              />
                            </SelectTrigger>
                            <SelectContent className="bg-black text-white border border-white">
                              {memberships.map((m) => (
                                <SelectItem
                                  key={m.userSub}
                                  value={m.userSub}
                                  className="text-white cursor-pointer"
                                >
                                  {m.displayName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="mb-2">{t("priority")}</Label>
                          <Select
                            value={newPriority}
                            onValueChange={(v) =>
                              setNewPriority(v as "low" | "medium" | "high")
                            }
                          >
                            <SelectTrigger className="bg-black text-white border border-white cursor-pointer">
                              <SelectValue placeholder="medium" />
                            </SelectTrigger>
                            <SelectContent className="bg-black text-white border border-white">
                              <SelectItem
                                className="cursor-pointer"
                                value="low"
                              >
                                {t("low")}
                              </SelectItem>
                              <SelectItem
                                className="cursor-pointer"
                                value="medium"
                              >
                                {t("medium")}
                              </SelectItem>
                              <SelectItem
                                className="cursor-pointer"
                                value="high"
                              >
                                {t("high")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:gap-2 space-y-2 md:space-y-0">
                          <div className="flex-1">
                            <Label className="mb-2">{t("dueDate")}</Label>
                            <DatePicker
                              value={newDueDate}
                              onChange={(date) => setNewDueDate(date)}
                              className="w-full"
                              locale={currentLocale}
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="mb-2">{t("dueTime")}</Label>
                            <CustomTimePicker
                              value={newDueTime}
                              onChange={setNewDueTime}
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="cursor-pointer"
                          disabled={isAddingTask}
                        >
                          {isAddingTask ? t("pleaseWait") : t("createTaskBtn")}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="cursor-pointer">
                        <Users className="h-4 w-4" /> {t("inviteBtn")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black border border-white text-white">
                      <DialogHeader>
                        <DialogTitle>{t("inviteTitle")}</DialogTitle>
                        <DialogDescription>{t("inviteDesc")}</DialogDescription>
                      </DialogHeader>
                      <Input
                        value={localProject.projectId}
                        readOnly
                        className="bg-black border border-white text-white"
                      />
                      <Button
                        className="cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(localProject.projectId);
                          toast.success(t("copiedIdMsg"));
                        }}
                      >
                        <ClipboardCopy className="h-4 w-4" /> {t("copyBtn")}
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
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.1 } },
                  }}
                >
                  <motion.div
                    className="bg-black border border-white p-4 rounded shadow hover:scale-101 transition-transform duration-300"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <h2 className="text-lg font-semibold mb-4 text-white">
                      {t("taskProgressOverview")}
                    </h2>
                    <Bar data={barData} options={chartOptions} />
                  </motion.div>
                  <motion.div
                    className="bg-black border border-white p-4 rounded shadow hover:scale-101 transition-transform duration-300"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <h2 className="text-lg font-semibold mb-4 text-white">
                      {t("taskStatusDistribution")}
                    </h2>
                    <Pie data={pieData} options={chartOptions} />
                  </motion.div>
                  <motion.div
                    className="bg-black border border-white p-4 rounded shadow hover:scale-101 transition-transform duration-300"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <h2 className="text-lg font-semibold mb-4 text-white">
                      {t("tasksByPriority")}
                    </h2>
                    <Bar data={tasksByPriorityData} options={chartOptions} />
                  </motion.div>
                  <motion.div
                    className="bg-black border border-white p-4 rounded shadow hover:scale-101 transition-transform duration-300"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <h2 className="text-lg font-semibold mb-4 text-white">
                      {t("tasksByAssignee")}
                    </h2>
                    <Bar data={tasksByAssigneeData} options={chartOptions} />
                  </motion.div>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="bg-none border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
                  >
                    <h2 className="text-lg font-semibold mb-4 text-white">
                      {t("tasksByDueDateLine")}
                    </h2>
                    <Line
                      data={tasksByDueDateLineData}
                      options={chartOptions}
                    />
                  </motion.div>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="bg-none border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
                  >
                    <h2 className="text-lg font-semibold mb-4 text-white">
                      {t("tasksByDueDateBar")}
                    </h2>
                    <Bar
                      data={tasksByDueDateBarData}
                      options={{ ...chartOptions, indexAxis: "y" }}
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="bg-black border border-white p-4 rounded shadow transition-transform duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    {t("tasks")}
                  </h2>
                  <div className="overflow-x-auto rounded-[8px] overflow-hidden">
                    <table className="min-w-[700px] w-full text-sm">
                      <thead className="bg-gray-800 text-gray-300">
                        <tr>
                          <th className="p-2 text-left">{t("title")}</th>
                          <th className="p-2 text-left">{t("status")}</th>
                          <th className="p-2 text-left">{t("priority")}</th>
                          <th className="p-2 text-left">Due</th>
                          <th className="p-2 text-left">{t("assignee")}</th>
                          <th className="p-2 text-left">{t("action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task) => {
                          const colorByPriority =
                            task.priority === "high"
                              ? "text-red-400"
                              : task.priority === "low"
                                ? "text-green-400"
                                : "text-yellow-400";
                          return (
                            <tr
                              key={task._id}
                              className="border-t border-gray-700"
                            >
                              <td className="p-2 text-white">{task.title}</td>
                              <td className="p-2 capitalize">
                                {task.status === "todo" && (
                                  <Circle className="inline-block mr-1 h-4 w-4 text-gray-400" />
                                )}
                                {task.status === "in-progress" && (
                                  <Loader2 className="inline-block mr-1 h-4 w-4 text-yellow-400 animate-spin" />
                                )}
                                {task.status === "done" && (
                                  <CheckCircle2 className="inline-block mr-1 h-4 w-4 text-green-400" />
                                )}
                                <span
                                  className={`font-bold ${
                                    task.status === "todo"
                                      ? "text-gray-400"
                                      : task.status === "in-progress"
                                        ? "text-yellow-400"
                                        : task.status === "done"
                                          ? "text-green-400"
                                          : "text-white"
                                  }`}
                                >
                                  {t(`statuses.${task.status}`)}
                                </span>
                              </td>
                              <td
                                className={`p-2 capitalize ${colorByPriority}`}
                              >
                                {t(`priorities.${task.priority}`)}
                              </td>
                              <td className="p-2">
                                {(() => {
                                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                  // @ts-ignore
                                  const dueDate = task.dueDate
                                    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                      // @ts-ignore
                                      new Date(task.dueDate)
                                    : new Date();
                                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                  // @ts-ignore
                                  const timeLeftText = task.dueDate
                                    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                      // @ts-ignore
                                      getTimeLeft(task.dueDate, t)
                                    : getTimeLeft(new Date().toISOString(), t);
                                  const isOverdue = [
                                    "overdue",
                                    "đã quá hạn",
                                  ].includes(timeLeftText.toLowerCase());
                                  return (
                                    <span>
                                      {format(dueDate, "PP", {
                                        locale: currentLocale,
                                      })}{" "}
                                      (
                                      <span
                                        className={
                                          isOverdue
                                            ? "text-red-500"
                                            : "text-green-500"
                                        }
                                      >
                                        {timeLeftText}
                                      </span>
                                      )
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="p-2 text-white">
                                {task.assignedTo
                                  ? memberships.find(
                                      (m) => m.userSub === task.assignedTo,
                                    )?.displayName || task.assignedTo
                                  : "-"}
                              </td>
                              <td className="p-2 flex gap-2 items-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleStatus(task._id)}
                                  disabled={
                                    myMembership?.role === "viewer" ||
                                    togglingTaskId === task._id
                                  }
                                  className="text-white border-white cursor-pointer"
                                >
                                  <CircleCheck className="mr-2 h-4 w-4" />
                                  {t("toggle")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={myMembership?.role === "viewer"}
                                  onClick={() =>
                                    openEditDialog(
                                      task._id,
                                      task.title,
                                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                      // @ts-ignore
                                      task.assignedTo,
                                      task.priority || "medium",
                                    )
                                  }
                                  className="text-white border-white cursor-pointer"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    openDeleteDialogForTask(
                                      task._id,
                                      task.title,
                                    )
                                  }
                                  disabled={
                                    myMembership?.role === "viewer" ||
                                    isDeletingTask
                                  }
                                  className="text-white cursor-pointer"
                                >
                                  {isDeletingTask ? (
                                    <div
                                      className="loader"
                                      aria-label="Loading..."
                                    />
                                  ) : (
                                    <Trash className="h-4 w-4" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                <Dialog
                  open={!!taskToDelete && deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <DialogContent className="">
                    <DialogHeader>
                      <DialogTitle>{t("deleteTaskConfirmTitle")}</DialogTitle>
                      <DialogDescription>
                        {taskToDelete
                          ? t("deleteTaskConfirmDesc", {
                              task: taskToDelete.title,
                            })
                          : t("deleteTaskConfirmDescGeneric")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-4 mt-4">
                      <Button
                        variant="destructive"
                        onClick={handleDeleteTask}
                        disabled={isDeletingTask}
                        className="cursor-pointer"
                      >
                        {isDeletingTask ? t("pleaseWait") : t("deleteTaskBtn")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={isDeletingTask}
                        className="cursor-pointer"
                      >
                        {t("cancel")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogContent className="bg-black border border-white text-white">
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
                          className="bg-black text-white border border-white"
                        />
                      </div>
                      <div>
                        <Label className="mb-2">{t("assignToLabel")}</Label>
                        <Select
                          value={taskAssigneeEdit}
                          onValueChange={(v) => setTaskAssigneeEdit(v)}
                        >
                          <SelectTrigger className="bg-black text-white border border-white cursor-pointer">
                            <SelectValue
                              placeholder={t("selectMemberOptional") || ""}
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-black text-white border border-white">
                            {memberships.map((m) => (
                              <SelectItem
                                key={m.userSub}
                                value={m.userSub}
                                className="text-white cursor-pointer"
                              >
                                {m.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="mb-2">{t("priority")}</Label>
                        <Select
                          value={taskPriorityEdit}
                          onValueChange={(v) =>
                            setTaskPriorityEdit(v as "low" | "medium" | "high")
                          }
                        >
                          <SelectTrigger className="bg-black text-white border border-white cursor-pointer">
                            <SelectValue placeholder="medium" />
                          </SelectTrigger>
                          <SelectContent className="bg-black text-white border border-white">
                            <SelectItem
                              value="low"
                              className="text-white cursor-pointer"
                            >
                              {t("low")}
                            </SelectItem>
                            <SelectItem
                              value="medium"
                              className="text-white cursor-pointer"
                            >
                              {t("medium")}
                            </SelectItem>
                            <SelectItem
                              value="high"
                              className="text-white cursor-pointer"
                            >
                              {t("high")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center md:gap-2 space-y-2 md:space-y-0">
                        <div className="flex-1">
                          <Label className="mb-2">{t("dueDate")}</Label>
                          <DatePicker
                            value={taskDueDateEdit}
                            onChange={setTaskDueDateEdit}
                            className="w-full"
                            locale={currentLocale}
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="mb-2">{t("dueTime")}</Label>
                          <CustomTimePicker
                            value={taskDueTimeEdit}
                            onChange={setTaskDueTimeEdit}
                            className="w-full"
                          />
                        </div>
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

                <motion.div
                  className="bg-black border border-white p-4 rounded shadow transition-transform duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    {t("manageRolesMembers")}
                  </h2>
                  <div className="overflow-x-auto rounded-[8px] overflow-hidden">
                    <table className="min-w-[600px] w-full text-sm">
                      <thead className="bg-gray-800 text-gray-300">
                        <tr>
                          <th className="p-2 text-left">{t("member")}</th>
                          <th className="p-2 text-left">{t("role")}</th>
                          {isManager && (
                            <th className="p-2 text-left">{t("action")}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {memberships.map((m) => (
                          <tr
                            key={m.userSub}
                            className="border-t border-gray-700"
                          >
                            <td className="p-2 text-white">
                              {m.displayName}{" "}
                              {m.userSub === userSub ? t("you") : ""}
                            </td>
                            <td className="p-2 text-white capitalize">
                              {t(`roles.${m.role}`)}
                            </td>
                            {isManager && (
                              <td className="p-2 flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleOpenRoleDialog(m.userSub, m.role)
                                  }
                                  className="text-white border-white cursor-pointer"
                                >
                                  {t("editRole")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setMemberToRemove(m.userSub);
                                    setRemoveMemberDialogOpen(true);
                                  }}
                                  className="text-white cursor-pointer"
                                  disabled={m.userSub === userSub}
                                >
                                  {t("remove")}
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </>
            )}

            <Dialog
              open={removeMemberDialogOpen}
              onOpenChange={setRemoveMemberDialogOpen}
            >
              <DialogContent className="bg-black border border-white text-white">
                <DialogHeader>
                  <DialogTitle>{t("confirmRemoveMemberTitle")}</DialogTitle>
                  <DialogDescription>
                    {t("confirmRemoveMemberDesc")}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => {
                      if (memberToRemove) {
                        handleRemoveMember(memberToRemove);
                      }
                      setRemoveMemberDialogOpen(false);
                      setMemberToRemove(null);
                    }}
                  >
                    {t("remove")}
                  </Button>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      setRemoveMemberDialogOpen(false);
                      setMemberToRemove(null);
                    }}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
              <DialogContent className="bg-black border border-white text-white">
                <DialogHeader>
                  <DialogTitle>{t("updateRole")}</DialogTitle>
                  <DialogDescription>{t("assignNewRole")}</DialogDescription>
                </DialogHeader>
                <Select
                  value={newRole}
                  onValueChange={(v) =>
                    setNewRole(v as "manager" | "editor" | "viewer")
                  }
                >
                  <SelectTrigger className="bg-black text-white border border-white cursor-pointer">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white border border-white">
                    <SelectItem
                      value="manager"
                      className="text-white cursor-pointer"
                    >
                      {t("manager")}
                    </SelectItem>
                    <SelectItem
                      value="editor"
                      className="text-white cursor-pointer"
                    >
                      {t("editor")}
                    </SelectItem>
                    <SelectItem
                      value="viewer"
                      className="text-white cursor-pointer"
                    >
                      {t("viewer")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setRoleDialogOpen(false)}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={handleSaveRole}
                  >
                    {t("saveChanges")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </>
  );
}

// (2) Export a dynamic, client-only version
export default dynamic(() => Promise.resolve(ProjectDetailPageInternal), {
  ssr: false,
});
