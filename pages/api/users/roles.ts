import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { sub } = req.query;

  // e.g., GET /api/users/roles?sub=auth0|67ed7e518efad4e72a73d7c3
  if (!sub || typeof sub !== "string") {
    return res.status(400).json({ error: "Missing user sub" });
  }

  try {
    // Hard-coded domain, client_id, client_secret as you requested
    const domain = process.env.AUTH0_TENANT_DOMAIN;
    const clientId = process.env.AUTH0_M2M_CLIENT_ID;
    const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

    // 1) Obtain a Management API token with client_credentials
    const tokenRes = await axios.post(`https://${domain}/oauth/token`, {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
    });

    const mgmtToken = tokenRes.data.access_token;

    // 2) Call GET /api/v2/users/{id}/roles to get the user's roles
    const rolesRes = await axios.get(
      `https://${domain}/api/v2/users/${encodeURIComponent(sub)}/roles`,
      {
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
        },
      },
    );

    // rolesRes.data is an array of role objects, e.g. [{id, name, ...}, ...]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRoles = rolesRes.data.map((r: any) => r.name);

    return res.status(200).json({ roles: userRoles });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Management API error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch roles" });
  }
}
