import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const user = session.user;
  await dbConnect();

  // Create a project
  if (req.method === "POST") {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // generate a short ID
    const shortId = uuidv4().split("-")[0];

    // The user who creates is manager
    const userSub = user.sub;

    const newProject = await Project.create({
      projectId: shortId,
      name,
      description: description || "",
      members: [userSub], // optional to keep
      membership: [
        {
          userSub,
          role: "manager", // auto-assign manager
        },
      ],
      tasks: [],
    });

    return res.status(201).json({
      _id: newProject._id.toString(),
      projectId: newProject.projectId,
      name: newProject.name,
      description: newProject.description,
      members: newProject.members,
      membership: newProject.membership,
      tasks: newProject.tasks,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
