import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import Log from "@/models/Log";
import { roles } from "@/lib/roles";

/**
 * This API route handles the retrieval of logs.
 *
 * @param req - The incoming request object
 * @param res - The response object to send back
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check authentication and admin role
  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userRoles: string[] =
    session.user["http://myapp.example.com/roles"] || [];
  const isAdmin = userRoles.includes(roles.admin);
  if (!isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    await dbConnect();
    // Fetch the latest 50 logs sorted by timestamp descending
    const logs = await Log.find({}).sort({ timestamp: -1 }).limit(50).lean();
    return res.status(200).json({ logs });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Logs API error:", err);
    return res.status(500).json({ error: "Failed to retrieve logs" });
  }
}
