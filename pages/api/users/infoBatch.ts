import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { users } = req.query;
  if (!users || typeof users !== "string") {
    return res.status(400).json({ error: "Missing users" });
  }
  try {
    const domain = process.env.AUTH0_TENANT_DOMAIN;
    const clientId = process.env.AUTH0_M2M_CLIENT_ID;
    const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;
    const tokenRes = await axios.post(`https://${domain}/oauth/token`, {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
    });
    const mgmtToken = tokenRes.data.access_token;
    const userSubs = users.split(",");
    const userRequests = userSubs.map((userSub) =>
      axios
        .get(`https://${domain}/api/v2/users/${encodeURIComponent(userSub)}`, {
          headers: { Authorization: `Bearer ${mgmtToken}` },
        })
        .then((response) => ({
          [userSub]: { name: response.data.name, email: response.data.email },
        }))
        .catch(() => ({ [userSub]: {} })),
    );
    const resultsArray = await Promise.all(userRequests);
    const result = resultsArray.reduce(
      (acc, curr) => Object.assign(acc, curr),
      {},
    );
    return res.status(200).json(result);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err?.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch user info" });
  }
}
