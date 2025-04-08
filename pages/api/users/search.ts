import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongodb";
import { UserProfile } from "@/models/UserProfile";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  await dbConnect();
  const { q } = req.query;
  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Query parameter 'q' is required." });
  }

  try {
    const regex = new RegExp(q, "i");
    const users = await UserProfile.find({
      $or: [{ name: { $regex: regex } }, { nickname: { $regex: regex } }],
    });
    return res.status(200).json({ users });
  } catch (error) {
    console.error("User search error:", error);
    return res.status(500).json({ error: "Error searching for users." });
  }
}
