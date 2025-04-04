import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { user } = req.query;

  if (!user || typeof user !== "string") {
    return res.status(400).json({ error: "Missing user" });
  }

  const domain = process.env.AUTH0_ISSUER_BASE_URL?.replace(/^https?:\/\//, "");
  const clientId = process.env.AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;

  try {
    // 1. Get Auth0 Management API token
    const tokenRes = await axios.post(`https://${domain}/oauth/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: "client_credentials",
    });

    const accessToken = tokenRes.data.access_token;

    // 2. Fetch user info
    const userRes = await axios.get(
      `https://${domain}/api/v2/users/${encodeURIComponent(user)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const { name, email } = userRes.data;
    res.status(200).json({ name, email });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(
      "Auth0 user fetch error:",
      err?.response?.data || err.message,
    );
    res.status(500).json({ error: "Failed to fetch user info" });
  }
}
