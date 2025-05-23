import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import axios from "axios";
import { roles } from "@/lib/roles";

/**
 * Body expects: {
 *   action: "add" | "remove";
 *   userSub: string; // e.g. "auth0|abc123"
 *   roleName: string; // e.g. "admin"
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1) Check if the caller is logged in & an admin
  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const currentUserSub = session.user.sub;

  // Replace the direct session claim with a call to Auth0 Management API
  const domain = process.env.AUTH0_TENANT_DOMAIN;
  const clientId = process.env.AUTH0_M2M_CLIENT_ID;
  const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;
  if (!domain || !clientId || !clientSecret) {
    return res.status(500).json({
      error: "Auth0 M2M environment variables not configured properly.",
    });
  }

  // Obtain a Management API token using client_credentials
  const tokenRes = await axios.post(`https://${domain}/oauth/token`, {
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    audience: `https://${domain}/api/v2/`,
  });
  const mgmtToken = tokenRes.data.access_token;

  // Get current user's roles from Auth0 Management API
  const rolesRes = await axios.get(
    `https://${domain}/api/v2/users/${encodeURIComponent(currentUserSub)}/roles`,
    {
      headers: { Authorization: `Bearer ${mgmtToken}` },
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentUserRoles = rolesRes.data.map((r: any) => r.name);
  console.log(currentUserRoles);
  const isAdmin = currentUserRoles.includes(roles.admin);
  if (!isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // 2) Parse body
  const { action, userSub, roleName } = req.body || {};
  if (!action || !userSub || !roleName) {
    return res
      .status(400)
      .json({ error: "Missing required fields (action, userSub, roleName)" });
  }
  if (!["add", "remove"].includes(action)) {
    return res.status(400).json({ error: "action must be 'add' or 'remove'" });
  }

  try {
    // 3) Obtain a Management API token using M2M credentials

    // 4) Find the role by name
    // e.g. GET /api/v2/roles?name_filter=admin
    const searchRes = await axios.get(
      `https://${domain}/api/v2/roles?name_filter=${encodeURIComponent(roleName)}`,
      {
        headers: { Authorization: `Bearer ${mgmtToken}` },
      },
    );
    const foundRoles = searchRes.data;
    if (!Array.isArray(foundRoles) || foundRoles.length === 0) {
      return res.status(404).json({ error: `Role "${roleName}" not found.` });
    }

    const roleId = foundRoles[0].id;

    // 5) Add or remove the role from user
    if (action === "add") {
      // POST /api/v2/users/{id}/roles  { roles: [ roleId ] }
      await axios.post(
        `https://${domain}/api/v2/users/${encodeURIComponent(userSub)}/roles`,
        { roles: [roleId] },
        {
          headers: { Authorization: `Bearer ${mgmtToken}` },
        },
      );
    } else {
      // remove => DELETE /api/v2/users/{id}/roles
      await axios.delete(
        `https://${domain}/api/v2/users/${encodeURIComponent(userSub)}/roles`,
        {
          headers: { Authorization: `Bearer ${mgmtToken}` },
          data: { roles: [roleId] },
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: `Successfully ${action}ed role "${roleName}" for user ${userSub}.`,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Admin roles API error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to modify user roles" });
  }
}
