import { useEffect, useMemo, useState } from "react";
import { Bar, Pie, Line, Doughnut, Radar, PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale,
} from "chart.js";
import { motion } from "framer-motion";
import Head from "next/head";
import { format } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Register chart components.
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale,
);

type ProjectStats = {
  projectId: string;
  name: string;
  totalTasks: number;
  doneTasks: number;
  todoTasks: number;
  inProgressTasks: number;
};

export type DashboardProps = {
  userSub: string;
  isAdmin: boolean;
  totalProjects: number;
  totalTasks: number;
  doneTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  topProjects: ProjectStats[];
  largestProjectName: string;
  smallestProjectName: string;
  projectStats?: ProjectStats[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allProjects: any[];
};

function DashboardPageInternal() {
  const { t, i18n } = useTranslation("dashboard");
  const currentLocale = i18n.language === "vi" ? vi : enUS;

  // Local state to hold dashboard data fetched from the API endpoint.
  const [dashboardData, setDashboardData] = useState<DashboardProps | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data: DashboardProps = await res.json();
        setDashboardData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Create a safe default object so that hooks always see a defined object.
  const safeData: DashboardProps = dashboardData ?? {
    userSub: "",
    isAdmin: false,
    totalProjects: 0,
    totalTasks: 0,
    doneTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    topProjects: [],
    largestProjectName: "",
    smallestProjectName: "",
    projectStats: [],
    allProjects: [],
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: { color: "#ffffff" },
      },
      tooltip: {
        bodyColor: "#ffffff",
        titleColor: "#ffffff",
      },
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

  // 1) Bar chart for tasks by status.
  const barData = useMemo(() => {
    return {
      labels: [t("toDo"), t("inProgress"), t("completedTasks")],
      datasets: [
        {
          label: t("tasks"),
          data: [
            safeData.todoTasks,
            safeData.inProgressTasks,
            safeData.doneTasks,
          ],
          backgroundColor: ["#6b7280", "#facc15", "#10b981"],
        },
      ],
    };
  }, [safeData.todoTasks, safeData.inProgressTasks, safeData.doneTasks, t]);

  // 2) Pie chart for completed vs. not completed tasks.
  const pieData = useMemo(() => {
    const notDone = safeData.totalTasks - safeData.doneTasks;
    return {
      labels: [t("completedTasks"), t("toDo")],
      datasets: [
        {
          data: [safeData.doneTasks, notDone],
          backgroundColor: ["#10b981", "#6b7280"],
        },
      ],
    };
  }, [safeData.doneTasks, safeData.totalTasks, t]);

  // 3) Line chart: tasks by project by status using projectStats.
  const lineData = useMemo(() => {
    const labels = safeData.projectStats?.map((p) => p.name) || [];
    const todoData = safeData.projectStats?.map((p) => p.todoTasks) || [];
    const inProgressData =
      safeData.projectStats?.map((p) => p.inProgressTasks) || [];
    const completedData = safeData.projectStats?.map((p) => p.doneTasks) || [];
    return {
      labels,
      datasets: [
        {
          label: t("toDo"),
          data: todoData,
          borderColor: "#6b7280",
          backgroundColor: "rgba(107,114,128,0.4)",
          tension: 0.3,
          fill: true,
        },
        {
          label: t("inProgress"),
          data: inProgressData,
          borderColor: "#facc15",
          backgroundColor: "rgba(250,204,21,0.4)",
          tension: 0.3,
          fill: true,
        },
        {
          label: t("completedTasks"),
          data: completedData,
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.4)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [safeData.projectStats, t]);

  // 4) Doughnut chart.
  const doughnutData = useMemo(() => {
    return {
      labels: [t("toDo"), t("inProgress"), t("completedTasks")],
      datasets: [
        {
          data: [
            safeData.todoTasks,
            safeData.inProgressTasks,
            safeData.doneTasks,
          ],
          backgroundColor: ["#6b7280", "#facc15", "#10b981"],
        },
      ],
    };
  }, [safeData.todoTasks, safeData.inProgressTasks, safeData.doneTasks, t]);

  // 5) Radar chart.
  const radarData = useMemo(() => {
    return {
      labels: [t("toDo"), t("inProgress"), t("completedTasks")],
      datasets: [
        {
          label: t("status"),
          data: [
            safeData.todoTasks,
            safeData.inProgressTasks,
            safeData.doneTasks,
          ],
          backgroundColor: "rgba(250,204,21,0.4)",
          borderColor: "#facc15",
          pointBackgroundColor: "#facc15",
        },
      ],
    };
  }, [safeData.todoTasks, safeData.inProgressTasks, safeData.doneTasks, t]);

  // 6) PolarArea chart.
  const polarData = useMemo(() => {
    return {
      labels: [t("toDo"), t("inProgress"), t("completedTasks")],
      datasets: [
        {
          data: [
            safeData.todoTasks,
            safeData.inProgressTasks,
            safeData.doneTasks,
          ],
          backgroundColor: ["#6b7280", "#facc15", "#10b981"],
        },
      ],
    };
  }, [safeData.todoTasks, safeData.inProgressTasks, safeData.doneTasks, t]);

  // 7) Aggregate all tasks from all projects.
  const allTasks = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return safeData.allProjects.flatMap((project: any) => project.tasks || []);
  }, [safeData.allProjects]);

  // 8) Chart: Tasks by Priority (Bar chart).
  const tasksByPriorityData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allTasks.forEach((task: any) => {
      const prio = task.priority || "medium";
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
  }, [allTasks, t]);

  // 9) Line Chart: Tasks by Priority.
  const lineTasksByPriorityData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allTasks.forEach((task: any) => {
      const prio = task.priority || "medium";
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      counts[prio]++;
    });
    return {
      labels: [t("low"), t("medium"), t("high")],
      datasets: [
        {
          label: t("tasksByPriority"),
          data: [counts.low, counts.medium, counts.high],
          borderColor: "#4ade80",
          backgroundColor: "rgba(74,222,128,0.5)",
          fill: false,
          tension: 0.4,
          pointRadius: 5,
        },
      ],
    };
  }, [allTasks, t]);

  // 10) Aggregate tasks by due date.
  const tasksByDueDateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const today = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allTasks.forEach((task: any) => {
      const due = task.dueDate ? new Date(task.dueDate) : today;
      const formatted = format(due, "PP", { locale: currentLocale });
      counts[formatted] = (counts[formatted] || 0) + 1;
    });
    return counts;
  }, [allTasks, currentLocale]);

  // 11) Line Chart: Tasks by Due Date.
  const lineTasksByDueDateData = useMemo(() => {
    const labels = Object.keys(tasksByDueDateCounts).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
    const data = labels.map((label) => tasksByDueDateCounts[label]);
    return {
      labels,
      datasets: [
        {
          label: t("tasksByDueDateLine"),
          data,
          borderColor: "#4ade80",
          backgroundColor: "rgba(74,222,128,0.5)",
          tension: 0.4,
          fill: false,
          pointRadius: 4,
        },
      ],
    };
  }, [tasksByDueDateCounts, t]);

  // 12) Horizontal Bar Chart: Tasks by Due Date.
  const horizontalBarTasksByDueDateData = useMemo(() => {
    const labels = Object.keys(tasksByDueDateCounts).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
    const data = labels.map((label) => tasksByDueDateCounts[label]);
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
  }, [tasksByDueDateCounts, t]);

  const horizontalBarChartOptions = useMemo(
    () => ({
      ...chartOptions,
      indexAxis: "y" as const,
    }),
    [chartOptions],
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-white" />
      </div>
    );
  }
  if (!dashboardData || !dashboardData.userSub) {
    return (
      <p className="text-center text-white bg-none min-h-screen flex items-center justify-center">
        {t("pleaseLogIn")}
      </p>
    );
  }

  // Compute completed tasks ratio.
  const completionRate =
    safeData.totalTasks === 0
      ? 0
      : Math.round((safeData.doneTasks / safeData.totalTasks) * 100);

  return (
    <>
      <Head>
        <title>{t("dashboardPageTitle")}</title>
        <meta name="description" content={t("dashboardMetaDesc")} />
      </Head>
      <div className="min-h-screen bg-none text-white font-sans p-6 space-y-8">
        <motion.h1
          className="text-3xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {t("dashboardTitle")}
        </motion.h1>
        <motion.p
          className="text-gray-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t("dashboardSubtitle")}
        </motion.p>

        {/* 8 Stat Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {[
            {
              label: t("yourProjects"),
              value: safeData.totalProjects,
              textSize: "text-3xl",
            },
            {
              label: t("totalTasks"),
              value: safeData.totalTasks,
              textSize: "text-3xl",
            },
            {
              label: t("completedTasks"),
              value: safeData.doneTasks,
              textSize: "text-3xl",
            },
            {
              label: t("completionRate"),
              value: `${completionRate}%`,
              textSize: "text-3xl",
            },
            {
              label: t("inProgress"),
              value: safeData.inProgressTasks,
              textSize: "text-3xl",
            },
            {
              label: t("toDo"),
              value: safeData.todoTasks,
              textSize: "text-3xl",
            },
            {
              label: t("largestProject"),
              value: safeData.largestProjectName || "N/A",
              textSize: "text-lg",
            },
            {
              label: t("smallestProject"),
              value: safeData.smallestProjectName || "N/A",
              textSize: "text-lg",
            },
          ].map((card, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="bg-none border border-white p-4 rounded shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="text-sm text-gray-400 truncate">{card.label}</p>
              <p className={`${card.textSize} font-bold truncate`}>
                {card.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {/* 1) Bar Chart */}
          <motion.div
            variants={chartVariants}
            className="bg-none border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">{t("tasksByStatus")}</h2>
            <Bar data={barData} options={chartOptions} />
          </motion.div>
          {/* 2) Pie Chart */}
          <motion.div
            variants={chartVariants}
            className="bg-none border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">{t("doneVsNotDone")}</h2>
            <Pie data={pieData} options={chartOptions} />
          </motion.div>
          {/* 3) Line Chart */}
          <motion.div
            variants={chartVariants}
            className="bg-none border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">
              {t("tasksCreatedVsCompleted")}
            </h2>
            <Line data={lineData} options={chartOptions} />
          </motion.div>
          {/* 4) Doughnut Chart */}
          <motion.div
            variants={chartVariants}
            className="bg-none border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">
              {t("statusDistribution")}
            </h2>
            <Doughnut data={doughnutData} options={chartOptions} />
          </motion.div>
          {/* 5) Radar Chart */}
          <motion.div
            variants={chartVariants}
            className="bg-none border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">
              {t("statusDistribution")}
            </h2>
            <Radar data={radarData} options={chartOptions} />
          </motion.div>
          {/* 6) Polar Area Chart */}
          <motion.div
            variants={chartVariants}
            className="bg-none border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">{t("status")}</h2>
            <PolarArea data={polarData} options={chartOptions} />
          </motion.div>
          {/* 7) Tasks by Priority Chart (Bar) */}
          <motion.div
            variants={chartVariants}
            className="bg-none border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">
              {t("tasksByPriority")}
            </h2>
            <Bar data={tasksByPriorityData} options={chartOptions} />
          </motion.div>
          {/* 8) Tasks by Priority Chart (Line) */}
          <motion.div
            variants={chartVariants}
            className="bg-none border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">
              {t("tasksByPriority")}
            </h2>
            <Line data={lineTasksByPriorityData} options={chartOptions} />
          </motion.div>
          {/* 9) Line Chart for Tasks by Due Date */}
          <motion.div
            variants={chartVariants}
            className="bg-none border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4 text-white">
              {t("tasksByDueDate")}
            </h2>
            <Line data={lineTasksByDueDateData} options={chartOptions} />
          </motion.div>
          {/* 10) Horizontal Bar Chart for Tasks by Due Date */}
          <motion.div
            variants={chartVariants}
            className="bg-none border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4 text-white">
              {t("tasksByDueDate")}
            </h2>
            <Bar
              data={horizontalBarTasksByDueDateData}
              options={horizontalBarChartOptions}
            />
          </motion.div>
        </motion.div>

        {/* Table of Top 5 Projects by Tasks */}
        <motion.div
          className="bg-none border border-white p-4 rounded shadow-md space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold">{t("top5Projects")}</h2>
          {dashboardData.topProjects.length === 0 ? (
            <p className="text-gray-400">{t("noProjectsFound")}</p>
          ) : (
            <div className="overflow-x-auto rounded-[8px] overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-800 text-gray-300">
                  <tr>
                    <th className="p-2 text-left max-w-[200px] truncate">
                      {t("projectName")}
                    </th>
                    <th className="p-2 text-left truncate">
                      {t("totalTasks")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.topProjects.map((p) => (
                    <tr key={p.projectId} className="border-t border-gray-700">
                      <td className="p-2 max-w-[200px] overflow-x-auto truncate">
                        {p.name}
                      </td>
                      <td className="p-2 truncate">{p.totalTasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {dashboardData.isAdmin && (
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t("adminNote")}
          </motion.p>
        )}
      </div>
    </>
  );
}

// Export the component wrapped in dynamic import to prevent SSR
const DashboardPage = dynamic(() => Promise.resolve(DashboardPageInternal), {
  ssr: false,
});

export default DashboardPage;
