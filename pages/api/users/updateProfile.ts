import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getSession } from "@auth0/nextjs-auth0";
import { dbConnect } from "@/lib/mongodb";
import { UserProfile } from "@/models/UserProfile";

// Helper: Fetch full profile from Auth0 Management API.
async function fetchFullProfile(userSub: string) {
  const domain = process.env.AUTH0_TENANT_DOMAIN;
  const clientId = process.env.AUTH0_M2M_CLIENT_ID;
  const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

  // 1. Obtain a Management API token using client credentials.
  const tokenRes = await axios.post(`https://${domain}/oauth/token`, {
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    audience: `https://${domain}/api/v2/`,
  });
  const mgmtToken = tokenRes.data.access_token;

  // 2. Get the full user profile from Auth0.
  const auth0Res = await axios.get(
    `https://${domain}/api/v2/users/${encodeURIComponent(userSub)}`,
    { headers: { Authorization: `Bearer ${mgmtToken}` } },
  );

  return auth0Res.data;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Allow GET and PATCH methods.
  if (req.method !== "GET" && req.method !== "PATCH") {
    res.setHeader("Allow", ["GET", "PATCH"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userSub = session.user.sub;

  // Connect to MongoDB.
  await dbConnect();

  // GET: Retrieve the latest profile data from MongoDB.
  if (req.method === "GET") {
    try {
      let userProfile = await UserProfile.findOne({ userSub });
      if (!userProfile) {
        // If no cached profile exists, fetch full profile from Auth0.
        const auth0Profile = await fetchFullProfile(userSub);
        // Cache the profile by upserting into the database.
        userProfile = await UserProfile.findOneAndUpdate(
          { userSub },
          {
            sub: auth0Profile.sub,
            sid: auth0Profile.sid,
            name: auth0Profile.name,
            nickname: auth0Profile.nickname,
            email: auth0Profile.email,
            email_verified: auth0Profile.email_verified,
            picture: auth0Profile.picture,
            updated_at: auth0Profile.updated_at
              ? new Date(auth0Profile.updated_at)
              : new Date(),
          },
          { new: true, upsert: true },
        );
        return res
          .status(200)
          .json({ message: "Profile retrieved from Auth0", user: userProfile });
      }
      return res
        .status(200)
        .json({ message: "Profile retrieved", user: userProfile });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ error: "Failed to retrieve profile" });
    }
  }

  // PATCH: Update the profile in Auth0 then cache full profile data from Auth0.
  if (req.method === "PATCH") {
    const { name, nickname } = req.body; // Data to update

    const domain = process.env.AUTH0_TENANT_DOMAIN;
    const clientId = process.env.AUTH0_M2M_CLIENT_ID;
    const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

    try {
      // 1) Obtain a Management API token.
      const tokenRes = await axios.post(`https://${domain}/oauth/token`, {
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        audience: `https://${domain}/api/v2/`,
      });
      const mgmtToken = tokenRes.data.access_token;

      // 2) PATCH the user profile in Auth0.
      await axios.patch(
        `https://${domain}/api/v2/users/${encodeURIComponent(userSub)}`,
        { name, nickname },
        { headers: { Authorization: `Bearer ${mgmtToken}` } },
      );

      // 3) Retrieve the full updated user profile from Auth0.
      const fullProfile = await fetchFullProfile(userSub);

      // 4) Update or create the user profile cache in MongoDB.
      const cachedProfile = await UserProfile.findOneAndUpdate(
        { userSub },
        {
          sub: fullProfile.sub,
          sid: fullProfile.sid,
          name: fullProfile.name,
          nickname: fullProfile.nickname,
          email: fullProfile.email,
          email_verified: fullProfile.email_verified,
          picture: fullProfile.picture,
          updated_at: fullProfile.updated_at
            ? new Date(fullProfile.updated_at)
            : new Date(),
        },
        { new: true, upsert: true },
      );

      return res
        .status(200)
        .json({ message: "Profile updated", user: cachedProfile });
    } catch (error) {
      console.error(
        "Update profile error:",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        error.response?.data || error.message,
      );

      return res.status(500).json({ error: "Failed to update profile" });
    }
  }
}
