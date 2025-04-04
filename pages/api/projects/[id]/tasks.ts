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

  const { id } = req.query;
  const userSub = session.user.sub;

  await dbConnect();

  const project = await Project.findOne({ projectId: id });
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  if (!project.members.includes(userSub)) {
    return res
      .status(403)
      .json({ error: "You must be a project member to add tasks" });
  }

  if (req.method === "POST") {
    const { title, assignedTo } = req.body;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Invalid task title" });
    }

    const newTask = {
      _id: new Date().getTime().toString(), // or use uuid if you want
      title,
      status: "todo",
      assignedTo: assignedTo || null,
    };

    project.tasks.push(newTask);
    await project.save();

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

    return res.status(201).json(updated);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
