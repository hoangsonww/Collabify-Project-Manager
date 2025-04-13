import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";

/**
 * This API route handles the removal of a project member.
 *
 * @param req - The incoming request object
 * @param res - The response object to send back
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userSub = session.user.sub;
  const { id, memberSub } = req.query;

  await dbConnect();
  const project = await Project.findOne({ projectId: id });
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // only manager can remove members
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const membershipEntry = project.membership.find((m) => m.userSub === userSub);
  if (!membershipEntry || membershipEntry.role !== "manager") {
    return res.status(403).json({ error: "Only managers can remove members" });
  }

  // remove from membership
  project.membership = project.membership.filter(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (m) => m.userSub !== memberSub,
  );

  // optional: remove from old members array if you still use it
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  project.members = project.members.filter((m) => m !== memberSub);

  await project.save();
  return res.json({ success: true, message: "Member removed" });
}
