import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check auth
  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userSub = session.user.sub;

  // Connect DB
  await dbConnect();

  // Extract the project ID and task ID
  const { id, taskId } = req.query;
  if (!id || !taskId) {
    return res.status(400).json({ error: "Missing project or task ID" });
  }

  // Find the project
  const project = await Project.findOne({ projectId: id });
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Must be a member or an admin to proceed
  if (!project.members.includes(userSub)) {
    return res
      .status(403)
      .json({ error: "You must be a project member to modify tasks" });
  }

  // -------- GET (optional) --------
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
    });
  }

  // -------- PUT (Update) --------
  if (req.method === "PUT") {
    const { title, assignedTo } = req.body;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Invalid task title" });
    }

    const taskIndex = project.tasks.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t: any) => t._id.toString() === taskId,
    );
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Update the task
    project.tasks[taskIndex].title = title;
    project.tasks[taskIndex].assignedTo = assignedTo || null;
    // (Status could also be updated here, if you wanted)

    await project.save();

    // Return updated project
    const updated = {
      _id: project._id.toString(),
      projectId: project.projectId,
      name: project.name,
      description: project.description,
      members: project.members,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tasks: project.tasks.map((t: any) => ({
        _id: t._id.toString(),
        title: t.title,
        status: t.status,
        assignedTo: t.assignedTo || null,
      })),
    };

    return res.status(200).json(updated);
  }

  // -------- DELETE --------
  if (req.method === "DELETE") {
    const existingTaskIndex = project.tasks.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t: any) => t._id.toString() === taskId,
    );
    if (existingTaskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Remove that one task
    project.tasks.splice(existingTaskIndex, 1);
    await project.save();

    // Return updated project
    const updated = {
      _id: project._id.toString(),
      projectId: project.projectId,
      name: project.name,
      description: project.description,
      members: project.members,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tasks: project.tasks.map((t: any) => ({
        _id: t._id.toString(),
        title: t.title,
        status: t.status,
        assignedTo: t.assignedTo || null,
      })),
    };
    return res.status(200).json(updated);
  }

  // Fallback for disallowed methods
  return res.status(405).json({ error: "Method not allowed" });
}
