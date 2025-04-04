import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const domain = process.env.AUTH0_TENANT_DOMAIN;
  const clientId = process.env.AUTH0_M2M_CLIENT_ID;
  const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    return res
      .status(500)
      .json({ error: "Missing Auth0 environment variables" });
  }

  try {
    // 1) Obtain a Management API token with client_credentials
    const tokenRes = await axios.post(`https://${domain}/oauth/token`, {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
    });

    const mgmtToken = tokenRes.data.access_token;

    // 2) Call GET /api/v2/logs to get Auth0 logs
    const logsRes = await axios.get(`https://${domain}/api/v2/logs`, {
      headers: {
        Authorization: `Bearer ${mgmtToken}`,
      },
      params: {
        per_page: 50,
        sort: "date:-1",
      },
    });

    return res.status(200).json({ logs: logsRes.data });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(
      "Auth0 Management API error:",
      err.response?.data || err.message,
    );
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
}
