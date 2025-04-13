import { useUser } from "@auth0/nextjs-auth0/client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { roles } from "@/lib/roles";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import Head from "next/head";
import { toast } from "sonner";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Trans, useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function AdminPageInternal() {
  const { user, error, isLoading } = useUser();
  const { t } = useTranslation("admin");
  const [roleList, setRoleList] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [userSub, setUserSub] = useState("");
  const [roleName, setRoleName] = useState("");
  const [action, setAction] = useState("add");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch roles for the current user
  useEffect(() => {
    async function fetchRoles() {
      if (user?.sub) {
        try {
          const res = await fetch(
            `/api/users/roles?sub=${encodeURIComponent(user.sub)}`,
          );
          if (!res.ok) throw new Error("Failed to fetch roles");
          const data = await res.json();
          setRoleList(data.roles || []);
        } catch (err) {
          console.error("Error fetching roles:", err);
        } finally {
          setLoadingRoles(false);
        }
      } else {
        setLoadingRoles(false);
      }
    }
    fetchRoles();
  }, [user]);

  // Fetch system logs only if user is authenticated and confirmed as admin
  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/users/logs");
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoadingLogs(false);
      }
    }
    if (user && roleList.includes(roles.admin)) {
      fetchLogs();
    } else {
      setLoadingLogs(false);
    }
  }, [user, roleList]);

  // Prepare chart data: logs by type
  const logsByType = logs.reduce((acc: Record<string, number>, log) => {
    const type = log.type || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(logsByType),
    datasets: [
      {
        label: t("logsByType"),
        data: Object.values(logsByType),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data: logs over time (by day)
  const logsByDay = logs.reduce((acc: Record<string, number>, log) => {
    const day = new Date(log.date).toLocaleDateString();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  const sortedDays = Object.keys(logsByDay).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  const lineChartData = {
    labels: sortedDays,
    datasets: [
      {
        label: t("logsOverTime"),
        data: sortedDays.map((day) => logsByDay[day]),
        fill: false,
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        borderColor: "rgba(16, 185, 129, 1)",
      },
    ],
  };

  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLoading) return;

    setFeedback(null);
    setFeedbackError(null);
    setSubmitLoading(true);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userSub, roleName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unknown error");
      }
      toast.success(t("roleChangeSuccess"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err);
      toast.error(t("roleChangeError"));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Loading and permission checks
  if (isLoading || loadingRoles) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-none text-white">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        {t("loading")}
      </div>
    );
  }
  if (error) {
    return (
      <p className="text-red-500 text-center mt-4">Error: {error.message}</p>
    );
  }
  if (!user) {
    return (
      <p className="text-center text-white bg-none min-h-screen flex items-center justify-center">
        {t("pleaseLoginViewPage")}
      </p>
    );
  }

  const isAdmin = roleList.includes(roles.admin);
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-none text-white flex flex-col text-center items-center justify-center">
        <p>{t("noPermission")}</p>
        <Button
          variant="link"
          className="mt-4 text-blue-500 cursor-pointer underline hover:text-blue-700"
          onClick={() =>
            (window.location.href = "https://sonnguyenhoang.com#contact")
          }
        >
          {t("contactAdmin")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t("adminTitle")}</title>
        <meta name="description" content={t("adminMetaDesc")} />
      </Head>
      <motion.div
        className="min-h-screen bg-none text-white p-6 font-sans space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-3xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {t("adminPanel")}
        </motion.h1>
        <motion.p
          className="text-gray-300 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {t("manageSystemWide")}
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* User Management Section */}
          <motion.div
            variants={cardVariants}
            className="bg-none border border-white p-6 rounded shadow transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <h2 className="text-xl font-semibold mb-2">
              {t("userManagement")}
            </h2>
            <p className="text-gray-400 text-sm mb-4">{t("assignOrRevoke")}</p>
            <form onSubmit={handleRoleChange} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  {t("userSubLabel")}
                </label>
                <input
                  type="text"
                  value={userSub}
                  onChange={(e) => setUserSub(e.target.value)}
                  className="w-full p-2 bg-none border border-gray-600 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  {t("roleNameLabel")}
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full p-2 bg-none border border-gray-600 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  {t("actionLabel")}
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full p-2 bg-none border border-gray-600 rounded"
                >
                  <option value="add">{t("addRole")}</option>
                  <option value="remove">{t("removeRole")}</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={submitLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
              >
                {submitLoading ? t("processing") : t("submit")}
              </button>
              {feedback && <p className="text-green-400">{feedback}</p>}
              {feedbackError && <p className="text-red-400">{feedbackError}</p>}
            </form>
          </motion.div>

          {/* System Logs List */}
          <motion.div
            variants={cardVariants}
            className="bg-none border border-white p-6 rounded shadow transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-xl font-semibold mb-2">{t("systemLogs")}</h2>
            <p className="text-gray-400 text-sm mb-4">
              {t("recentLoginActivity")}
            </p>
            {loadingLogs ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin w-6 h-6 mr-2" />
                {t("loading")}
              </div>
            ) : logs.length > 0 ? (
              <ul className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <li key={log._id} className="border-b border-gray-700 pb-2">
                    <p className="text-xs text-gray-500">
                      {new Date(log.date).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <strong>{log.type.toUpperCase()}:</strong> {log.ip}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">{t("noLogsAvailable")}</p>
            )}
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logs by Type Chart */}
          <motion.div
            variants={cardVariants}
            className="bg-none border border-white p-6 rounded shadow transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-xl font-semibold mb-2">{t("logsByType")}</h2>
            <Bar
              data={barChartData}
              options={{ plugins: { legend: { display: true } } }}
            />
          </motion.div>

          {/* Logs Over Time Chart */}
          <motion.div
            variants={cardVariants}
            className="bg-none border border-white p-6 rounded shadow transition-transform duration-300 hover:scale-102"
          >
            <h2 className="text-xl font-semibold mb-2">{t("logsOverTime")}</h2>
            <Line
              data={lineChartData}
              options={{ plugins: { legend: { display: true } } }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}

// Export a client-only version (no SSR) to avoid hydration mismatch
export default dynamic(() => Promise.resolve(AdminPageInternal), {
  ssr: false,
});
