import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { v4 as uuidv4 } from "uuid";

/**
 * Handler to manage projects.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A JSON response with the project data or an error message.
 */
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

  // --- GET: Return list of projects that the current user belongs to ---
  if (req.method === "GET") {
    try {
      const userSub = user.sub;
      // Query projects where the current user is in the membership array
      const userProjects = await Project.find({
        "membership.userSub": userSub,
      }).lean();
      // Serialize projects – no legacy members field assumed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const projectsFormatted = userProjects.map((project: any) => ({
        _id: project._id.toString(),
        projectId: project.projectId,
        name: project.name,
        description: project.description || "",
        membership: project.membership || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tasks: (project.tasks || []).map((task: any) => ({
          _id: task._id.toString(),
          title: task.title,
          status: task.status,
          assignedTo: task.assignedTo || null,
          priority: task.priority || "medium",
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
        })),
      }));
      return res.status(200).json({ projects: projectsFormatted });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  // --- POST: Create a project ---
  if (req.method === "POST") {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // generate a short ID
    const shortId = uuidv4().split("-")[0];

    // The user who creates the project is automatically assigned as manager
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
