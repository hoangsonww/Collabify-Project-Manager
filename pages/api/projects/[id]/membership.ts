// File: /pages/api/projects/[id]/membership.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check user session
  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid project ID" });
  }

  // Connect to MongoDB
  await dbConnect();

  // Find the project
  const project = await Project.findOne({ projectId: id });
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // If you want to ensure only members (or managers) can see the membership,
  // add a check here:
  //
  // const userSub = session.user.sub;
  // const inMembership = project.membership?.some(m => m.userSub === userSub);
  // if (!inMembership) {
  //   return res.status(403).json({ error: "You are not in this project" });
  // }

  // Return the membership array
  return res.status(200).json({
    membership: project.membership || [],
  });
}
