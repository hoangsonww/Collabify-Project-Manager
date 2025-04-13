import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";

/**
 * Handler to remove a member from a project.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A JSON response indicating success or failure.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userSub = session.user.sub;
  const { id } = req.query;

  await dbConnect();
  const project = await Project.findOne({ projectId: id });
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Remove the user from the members array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project.members = project.members.filter((m: any) => m !== userSub);

  // Remove the user from the membership list.
  project.membership = project.membership.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (member: any) => member.userSub !== userSub,
  );

  await project.save();
  return res.json({ success: true });
}
