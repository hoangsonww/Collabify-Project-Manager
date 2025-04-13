import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { roles } from "@/lib/roles";

/**
 * Handler to get dashboard statistics.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A JSON response with dashboard statistics or an error message.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Authenticate the current session.
  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const user = session.user;
  const userSub = user.sub || "";
  const userRoles: string[] = user["http://myapp.example.com/roles"] || [];
  const isAdmin = userRoles.includes(roles.admin);

  // Connect to the database.
  await dbConnect();

  // Query projects: if admin, fetch all projects; if not, only projects where the user is in the membership array.
  const query = isAdmin ? {} : { "membership.userSub": userSub };
  const allProjects = await Project.find(query);

  // Serialize allProjects for use in dashboard charts (convert _id and date fields to strings).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allProjectsSerialized = allProjects.map((p: any) => ({
    _id: p._id.toString(),
    projectId: p.projectId,
    name: p.name,
    description: p.description || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    membership: (p.membership || []).map((m: any) => ({
      userSub: m.userSub,
      role: m.role,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasks: (p.tasks || []).map((t: any) => ({
      _id: t._id.toString(),
      title: t.title,
      status: t.status,
      assignedTo: t.assignedTo || null,
      priority: t.priority || "medium",
      dueDate: t.dueDate
        ? new Date(t.dueDate).toISOString()
        : new Date().toISOString(),
    })),
  }));

  // Overall counters and project-level statistics.
  let totalTasks = 0;
  let doneTasks = 0;
  let todoTasks = 0;
  let inProgressTasks = 0;

  type ProjectStats = {
    projectId: string;
    name: string;
    totalTasks: number;
    doneTasks: number;
    todoTasks: number;
    inProgressTasks: number;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectStats: ProjectStats[] = allProjectsSerialized.map((p: any) => {
    const tasksArray = p.tasks || [];
    const total = tasksArray.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const done = tasksArray.filter((t: any) => t.status === "done").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todo = tasksArray.filter((t: any) => t.status === "todo").length;
    const inProgress = tasksArray.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t: any) => t.status === "in-progress",
    ).length;
    return {
      projectId: p.projectId,
      name: p.name,
      totalTasks: total,
      doneTasks: done,
      todoTasks: todo,
      inProgressTasks: inProgress,
    };
  });

  // Top 5 projects (based on total tasks)
  const topProjects = [...projectStats]
    .sort((a, b) => b.totalTasks - a.totalTasks)
    .slice(0, 5);

  // Determine the largest and smallest projects (by number of tasks)
  let largestProjectName = "";
  let smallestProjectName = "";
  if (projectStats.length > 0) {
    const sorted = [...projectStats].sort(
      (a, b) => b.totalTasks - a.totalTasks,
    );
    largestProjectName = sorted[0].name;
    smallestProjectName = sorted[sorted.length - 1].name;
  }

  // Tally overall task counts across projects.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allProjectsSerialized.forEach((project: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (project.tasks || []).forEach((t: any) => {
      totalTasks++;
      if (t.status === "done") doneTasks++;
      else if (t.status === "in-progress") inProgressTasks++;
      else if (t.status === "todo") todoTasks++;
    });
  });

  return res.status(200).json({
    userSub,
    isAdmin,
    totalProjects: allProjectsSerialized.length,
    totalTasks,
    doneTasks,
    todoTasks,
    inProgressTasks,
    topProjects,
    largestProjectName,
    smallestProjectName,
    projectStats,
    allProjects: allProjectsSerialized,
  });
}
