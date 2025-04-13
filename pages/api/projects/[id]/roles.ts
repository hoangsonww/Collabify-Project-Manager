import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";

/**
 * Handler to add a user to a project's membership.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A JSON response indicating success or failure.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT") {
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

  // check if current user is manager
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const membershipEntry = project.membership.find((m) => m.userSub === userSub);
  if (!membershipEntry || membershipEntry.role !== "manager") {
    return res
      .status(403)
      .json({ error: "Only project managers can assign roles" });
  }

  // parse body: targetUserSub, newRole (editor/viewer/manager)
  const { targetUserSub, newRole } = req.body || {};
  if (!targetUserSub || !["manager", "editor", "viewer"].includes(newRole)) {
    return res.status(400).json({ error: "Invalid role or missing user sub" });
  }

  const targetMembership = project.membership.find(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (m) => m.userSub === targetUserSub,
  );
  if (!targetMembership) {
    return res
      .status(404)
      .json({ error: "That user is not in the project membership" });
  }

  // assign new role
  targetMembership.role = newRole;
  await project.save();

  return res.json({
    success: true,
    message: `Updated role of user ${targetUserSub} to ${newRole}`,
  });
}
