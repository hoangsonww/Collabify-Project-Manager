import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";

/**
 * Handler to get a project by ID.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A JSON response with the project details or an error message.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    query: { id },
    method,
  } = req;

  switch (method) {
    case "GET":
      try {
        // Get session for auth.
        const session = await getSession(req, res);
        if (!session?.user) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        await dbConnect();

        // Find the project + membership + tasks.
        const found = await Project.findOne({ projectId: id }).lean();
        if (!found) return res.status(404).json({ error: "Project not found" });

        // Convert to plain object and serialize the dueDate field as a string.
        const project = {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          _id: found._id.toString(),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          projectId: found.projectId,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          name: found.name,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          description: found.description || "",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          membership: found.membership || [],
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tasks: (found.tasks || []).map((t) => ({
            _id: t._id.toString(),
            title: t.title,
            status: t.status,
            assignedTo: t.assignedTo || null,
            priority: t.priority || "medium",
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
          })),
        };

        return res.status(200).json({ project });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
      }
    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
