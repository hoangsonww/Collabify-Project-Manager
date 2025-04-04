import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getSession(req, res);
  if (!session?.user)
    return res.status(401).json({ error: "Not authenticated" });

  const { id, taskId } = req.query;
  const userSub = session.user.sub;

  await dbConnect();

  const project = await Project.findOne({ projectId: id });
  if (!project) return res.status(404).json({ error: "Project not found" });

  if (!project.members.includes(userSub)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const task = project.tasks.id(taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const nextStatus =
    task.status === "todo"
      ? "in-progress"
      : task.status === "in-progress"
        ? "done"
        : "todo";

  task.status = nextStatus;
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

  return res.status(200).json(updated);
}
