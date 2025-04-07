import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check authentication
  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userSub = session.user.sub;

  // Connect to DB
  await dbConnect();

  const { id, taskId } = req.query;
  if (!id || !taskId) {
    return res.status(400).json({ error: "Missing project or task ID" });
  }

  // Find the project
  const project = await Project.findOne({ projectId: id });
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Check membership using the new membership array
  const membership = project.membership?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (m: any) => m.userSub === userSub,
  );
  if (!membership) {
    return res
      .status(403)
      .json({ error: "You must be a project member to modify tasks" });
  }

  // Find the task to toggle
  const taskIndex = project.tasks.findIndex(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (t: any) => t._id.toString() === taskId,
  );
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const task = project.tasks[taskIndex];

  // Toggle logic: cycle through statuses: "todo" -> "in-progress" -> "done" -> "todo"
  let newStatus;
  switch (task.status) {
    case "todo":
      newStatus = "in-progress";
      break;
    case "in-progress":
      newStatus = "done";
      break;
    case "done":
      newStatus = "todo";
      break;
    default:
      newStatus = "todo";
  }
  task.status = newStatus;

  await project.save();

  const updated = {
    _id: project._id.toString(),
    projectId: project.projectId,
    name: project.name,
    description: project.description,
    membership: project.membership,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasks: project.tasks.map((t: any) => ({
      _id: t._id.toString(),
      title: t.title,
      status: t.status,
      assignedTo: t.assignedTo || null,
      priority: t.priority || "medium",
    })),
  };

  return res.status(200).json(updated);
}
