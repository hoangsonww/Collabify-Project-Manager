import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getSession } from "@auth0/nextjs-auth0";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow PATCH requests
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userSub = session.user.sub;

  const { name, nickname } = req.body; // Data to update

  const domain = process.env.AUTH0_TENANT_DOMAIN;
  const clientId = process.env.AUTH0_M2M_CLIENT_ID;
  const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

  try {
    // 1) Obtain a Management API token using client credentials.
    const tokenRes = await axios.post(`https://${domain}/oauth/token`, {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
    });
    const mgmtToken = tokenRes.data.access_token;

    // 2) PATCH the user profile via the Management API.
    const updateRes = await axios.patch(
      `https://${domain}/api/v2/users/${encodeURIComponent(userSub)}`,
      {
        name,
        nickname,
      },
      {
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
        },
      },
    );
    return res
      .status(200)
      .json({ message: "Profile updated", user: updateRes.data });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.error(
      "Update profile error:",
      error.response?.data || error.message,
    );
    return res.status(500).json({ error: "Failed to update profile" });
  }
}
