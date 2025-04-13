import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

/**
 * Handler to get user information using Auth0 Management API.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A JSON response with the user information or an error message.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { user } = req.query;

  if (!user || typeof user !== "string") {
    return res.status(400).json({ error: "Missing user" });
  }

  try {
    const domain = process.env.AUTH0_TENANT_DOMAIN;
    const clientId = process.env.AUTH0_M2M_CLIENT_ID;
    const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

    // 1) Obtain a Management API token using M2M credentials
    const tokenRes = await axios.post(`https://${domain}/oauth/token`, {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
    });

    const mgmtToken = tokenRes.data.access_token;

    // 2) Fetch user info using the M2M token
    const userRes = await axios.get(
      `https://${domain}/api/v2/users/${encodeURIComponent(user)}`,
      {
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
        },
      },
    );

    const { name, email } = userRes.data;
    res.status(200).json({ name, email });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Management API error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
}
