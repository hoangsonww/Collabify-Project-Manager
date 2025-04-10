import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";

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

  // If not already in membership, push as editor
  const alreadyInMembership = project.membership.some(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (m) => m.userSub === userSub,
  );
  if (!alreadyInMembership) {
    project.membership.push({ userSub, role: "editor" });
  }

  // If not already in the old members array, push it
  if (!project.members.includes(userSub)) {
    project.members.push(userSub);
  }

  await project.save();

  return res.json({ success: true });
}
