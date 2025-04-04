// pages/dashboard.tsx
import { getSession } from "@auth0/nextjs-auth0";
import { GetServerSideProps } from "next";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { roles } from "@/lib/roles";
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
import { useMemo } from "react";
import { motion } from "framer-motion";
import Head from "next/head";

// === (1) IMPORT i18next + dynamic ===
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";

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

// Keep your data types exactly as is
type ProjectStats = {
  projectId: string;
  name: string;
  totalTasks: number;
};

type DashboardProps = {
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
};

// === (2) The REAL component that uses react-i18next ===
function DashboardPageInternal({
  userSub,
  isAdmin,
  totalProjects,
  totalTasks,
  doneTasks,
  todoTasks,
  inProgressTasks,
  topProjects,
  largestProjectName,
  smallestProjectName,
}: DashboardProps) {
  // Pull strings from the "dashboard" namespace
  const { t } = useTranslation("dashboard");

  if (!userSub) {
    return <p className="text-white">{t("pleaseLogIn")}</p>;
  }

  // Completed tasks ratio
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  // Common chart options for dark mode
  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
        },
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

  // 1) Bar chart for tasks by status
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const barData = useMemo(() => {
    return {
      labels: [t("toDo"), t("inProgress"), t("completedTasks")],
      datasets: [
        {
          label: "Tasks",
          data: [todoTasks, inProgressTasks, doneTasks],
          backgroundColor: ["#6b7280", "#facc15", "#10b981"],
        },
      ],
    };
  }, [todoTasks, inProgressTasks, doneTasks, t]);

  // 2) Pie chart for done vs not done
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const pieData = useMemo(() => {
    const notDone = totalTasks - doneTasks;
    return {
      labels: [t("completedTasks"), t("toDo")],
      datasets: [
        {
          data: [doneTasks, notDone],
          backgroundColor: ["#10b981", "#6b7280"],
        },
      ],
    };
  }, [doneTasks, totalTasks, t]);

  // 3) Line chart (dummy data for weeks)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const lineData = useMemo(() => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
    return {
      labels: weeks,
      datasets: [
        {
          label: "Tasks Created",
          data: [12, 20, 7, 13, 9],
          borderColor: "#facc15",
          backgroundColor: "rgba(250,204,21,0.4)",
          tension: 0.3,
          fill: true,
        },
        {
          label: "Tasks Completed",
          data: [5, 14, 10, 12, 8],
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.4)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, []);

  // 4) Doughnut chart
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const doughnutData = useMemo(() => {
    return {
      labels: [t("toDo"), t("inProgress"), t("completedTasks")],
      datasets: [
        {
          data: [todoTasks, inProgressTasks, doneTasks],
          backgroundColor: ["#6b7280", "#facc15", "#10b981"],
        },
      ],
    };
  }, [todoTasks, inProgressTasks, doneTasks, t]);

  // 5) Radar chart
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const radarData = useMemo(() => {
    return {
      labels: [t("toDo"), t("inProgress"), t("completedTasks")],
      datasets: [
        {
          label: "Status",
          data: [todoTasks, inProgressTasks, doneTasks],
          backgroundColor: "rgba(250,204,21,0.4)",
          borderColor: "#facc15",
          pointBackgroundColor: "#facc15",
        },
      ],
    };
  }, [todoTasks, inProgressTasks, doneTasks, t]);

  // 6) PolarArea chart
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const polarData = useMemo(() => {
    return {
      labels: [t("toDo"), t("inProgress"), t("completedTasks")],
      datasets: [
        {
          data: [todoTasks, inProgressTasks, doneTasks],
          backgroundColor: ["#6b7280", "#facc15", "#10b981"],
        },
      ],
    };
  }, [todoTasks, inProgressTasks, doneTasks, t]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <>
      <Head>
        <title>{t("dashboardPageTitle")}</title>
        <meta name="description" content={t("dashboardMetaDesc")} />
      </Head>
      <div className="min-h-screen bg-black text-white font-sans p-6 space-y-8">
        <motion.h1
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {t("dashboardTitle")}
        </motion.h1>

        {/* 8 Stat Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {[
            {
              label: t("yourProjects"),
              value: totalProjects,
              textSize: "text-3xl",
            },
            { label: t("totalTasks"), value: totalTasks, textSize: "text-3xl" },
            {
              label: t("completedTasks"),
              value: doneTasks,
              textSize: "text-3xl",
            },
            {
              label: t("completionRate"),
              value: `${completionRate}%`,
              textSize: "text-3xl",
            },
            {
              label: t("inProgress"),
              value: inProgressTasks,
              textSize: "text-3xl",
            },
            {
              label: t("toDo"),
              value: todoTasks,
              textSize: "text-3xl",
            },
            {
              label: t("largestProject"),
              value: largestProjectName || "N/A",
              textSize: "text-lg",
            },
            {
              label: t("smallestProject"),
              value: smallestProjectName || "N/A",
              textSize: "text-lg",
            },
          ].map((card, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="bg-black border border-white p-4 rounded shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="text-sm text-gray-400">{card.label}</p>
              <p className={`${card.textSize} font-bold`}>{card.value}</p>
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
            className="bg-black border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">{t("tasksByStatus")}</h2>
            <Bar data={barData} options={chartOptions} />
          </motion.div>
          {/* 2) Pie Chart */}
          <motion.div
            variants={chartVariants}
            className="bg-black border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">{t("doneVsNotDone")}</h2>
            <Pie data={pieData} options={chartOptions} />
          </motion.div>
          {/* 3) Line Chart */}
          <motion.div
            variants={chartVariants}
            className="bg-black border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">
              {t("tasksCreatedVsCompleted")}
            </h2>
            <Line data={lineData} options={chartOptions} />
          </motion.div>
          {/* 4) Doughnut Chart */}
          <motion.div
            variants={chartVariants}
            className="bg-black border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">
              {t("statusDistribution")}
            </h2>
            <Doughnut data={doughnutData} options={chartOptions} />
          </motion.div>
          {/* 5) Radar Chart */}
          <motion.div
            variants={chartVariants}
            className="bg-black border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">
              {t("statusDistribution")}
            </h2>
            <Radar data={radarData} options={chartOptions} />
          </motion.div>
          {/* 6) Polar Area Chart */}
          <motion.div
            variants={chartVariants}
            className="bg-black border border-white p-4 rounded shadow-md transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-lg font-semibold mb-4">{t("status")}</h2>
            <PolarArea data={polarData} options={chartOptions} />
          </motion.div>
        </motion.div>

        {/* Table of Top 5 Projects by tasks */}
        <motion.div
          className="bg-black border border-white p-4 rounded shadow-md space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold">{t("top5Projects")}</h2>
          {topProjects.length === 0 ? (
            <p className="text-gray-400">{t("noProjectsFound")}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="p-2 text-left">Project Name</th>
                  <th className="p-2 text-left">Total Tasks</th>
                </tr>
              </thead>
              <tbody>
                {topProjects.map((p) => (
                  <tr key={p.projectId} className="border-t border-gray-700">
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.totalTasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

        {isAdmin && (
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

// =============================================================
// SERVER-SIDE PROPS
// =============================================================
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession(req, res);
  if (!session?.user) {
    return {
      props: {
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
      },
    };
  }

  const user = session.user;
  const userSub = user.sub || "";
  const userRoles: string[] = user["http://myapp.example.com/roles"] || [];
  const isAdmin = userRoles.includes(roles.admin);

  await dbConnect();

  // If admin, see all projects; otherwise, only projects where user is a member
  const query = isAdmin ? {} : { members: userSub };
  const allProjects = await Project.find(query);

  // Overall counters
  let totalTasks = 0;
  let doneTasks = 0;
  let todoTasks = 0;
  let inProgressTasks = 0;

  // Build array with project-level stats
  const projectStats = allProjects.map((p) => {
    let count = 0;
    (p.tasks as Array<{ status: string }>).forEach((t) => {
      count++;
      console.log(t);
    });
    return {
      projectId: p.projectId,
      name: p.name,
      totalTasks: count,
    };
  });

  // Sort descending by totalTasks to find top 5
  const topProjects = projectStats
    .sort((a, b) => b.totalTasks - a.totalTasks)
    .slice(0, 5);

  // Find largest/smallest project
  let largestProjectName = "";
  let smallestProjectName = "";
  if (projectStats.length > 0) {
    const sorted = [...projectStats].sort(
      (a, b) => b.totalTasks - a.totalTasks,
    );
    largestProjectName = sorted[0].name;
    smallestProjectName = sorted[sorted.length - 1].name;
  }

  // Count tasks overall
  allProjects.forEach((project) => {
    (project.tasks as Array<{ status: string }>).forEach((t) => {
      totalTasks++;
      if (t.status === "done") doneTasks++;
      else if (t.status === "in-progress") inProgressTasks++;
      else if (t.status === "todo") todoTasks++;
    });
  });

  return {
    props: {
      userSub,
      isAdmin,
      totalProjects: allProjects.length,
      totalTasks,
      doneTasks,
      todoTasks,
      inProgressTasks,
      topProjects,
      largestProjectName,
      smallestProjectName,
    },
  };
};

// === (3) EXPORT a dynamic, client-only version of the page ===
const DashboardPage = dynamic(() => Promise.resolve(DashboardPageInternal), {
  ssr: false,
});

export default DashboardPage;
