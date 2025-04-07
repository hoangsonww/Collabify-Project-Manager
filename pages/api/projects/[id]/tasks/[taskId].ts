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

  // Connect to the DB
  await dbConnect();

  // Get project ID and task ID from query
  const { id, taskId } = req.query;
  if (!id || !taskId) {
    return res.status(400).json({ error: "Missing project or task ID" });
  }

  // Find the project by projectId
  const project = await Project.findOne({ projectId: id });
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Use the new membership field to check if the user is a member
  const membership = project.membership?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (m: any) => m.userSub === userSub,
  );
  if (!membership) {
    return res
      .status(403)
      .json({ error: "You must be a project member to modify tasks" });
  }

  // -------- GET: Return task details --------
  if (req.method === "GET") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const task = project.tasks.find((t: any) => t._id.toString() === taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    return res.status(200).json({
      _id: task._id.toString(),
      title: task.title,
      status: task.status,
      assignedTo: task.assignedTo || null,
      priority: task.priority || "medium",
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    });
  }

  // -------- PUT: Update a task --------
  if (req.method === "PUT") {
    const { title, assignedTo, priority, dueDate } = req.body;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Invalid task title" });
    }
    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({ error: "Invalid task priority" });
    }

    const taskIndex = project.tasks.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t: any) => t._id.toString() === taskId,
    );
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Update the task fields
    project.tasks[taskIndex].title = title;
    project.tasks[taskIndex].assignedTo = assignedTo || null;
    project.tasks[taskIndex].priority = priority || "medium";
    if (dueDate) {
      project.tasks[taskIndex].dueDate = new Date(dueDate);
    } else {
      project.tasks[taskIndex].dueDate = undefined;
    }

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
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      })),
    };

    return res.status(200).json(updated);
  }

  // -------- DELETE: Delete a task --------
  if (req.method === "DELETE") {
    const taskIndex = project.tasks.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t: any) => t._id.toString() === taskId,
    );
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }
    project.tasks.splice(taskIndex, 1);
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
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      })),
    };

    return res.status(200).json(updated);
  }

  // Fallback for disallowed methods
  return res.status(405).json({ error: "Method not allowed" });
}
