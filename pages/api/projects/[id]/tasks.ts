import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userSub = session.user.sub;

  await dbConnect();

  const { id } = req.query;
  const project = await Project.findOne({ projectId: id });
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Find membership entry
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const membershipEntry = project.membership.find((m) => m.userSub === userSub);
  if (!membershipEntry) {
    return res.status(403).json({ error: "Not a project member" });
  }

  // If user is viewer, forbid
  if (membershipEntry.role === "viewer") {
    return res.status(403).json({ error: "Viewers cannot add tasks" });
  }

  if (req.method === "POST") {
    const { _id, title, assignedTo, priority, dueDate } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    project.tasks.push({
      _id,
      title,
      status: "todo",
      assignedTo: assignedTo || null,
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : new Date(),
    });

    await project.save();

    return res.status(201).json({
      ...project.toObject(),
      _id: project._id.toString(),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      tasks: project.tasks.map((t) => ({
        _id: t._id,
        title: t.title,
        status: t.status,
        assignedTo: t.assignedTo,
        priority: t.priority,
        dueDate: t.dueDate,
      })),
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
