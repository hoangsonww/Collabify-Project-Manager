import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { v4 as uuidv4 } from "uuid";
import { roles } from "@/lib/roles";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const user = session.user;
  const userRoles = user["http://myapp.example.com/roles"] || [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isAdmin = userRoles.includes(roles.admin);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isManager = userRoles.includes(roles.projectManager);

  await dbConnect();

  if (req.method === "POST") {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const shortId = uuidv4().split("-")[0];
    const newProject = await Project.create({
      projectId: shortId,
      name,
      description: description || "",
      members: [],
      tasks: [],
    });
    return res.status(201).json({
      _id: newProject._id.toString(),
      projectId: newProject.projectId,
      name: newProject.name,
      description: newProject.description,
      members: newProject.members,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
