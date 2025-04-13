import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";

/**
 * Handler to delete a project.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await dbConnect();
  const { id } = req.query;
  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userSub = session.user.sub;

  // Find the project
  const project = await Project.findOne({ projectId: id });
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Check membership
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const membershipEntry = project.membership.find((m) => m.userSub === userSub);
  if (!membershipEntry) {
    return res.status(403).json({ error: "Not a project member" });
  }
  if (membershipEntry.role !== "manager") {
    return res
      .status(403)
      .json({ error: "Only project managers can delete the project" });
  }

  // If manager, delete the project
  if (req.method === "DELETE") {
    await Project.deleteOne({ projectId: id });
    return res.json({ success: true, message: "Project deleted" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
