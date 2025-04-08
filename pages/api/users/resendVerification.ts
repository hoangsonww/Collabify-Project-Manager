import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getSession } from "@auth0/nextjs-auth0";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userSub = session.user.sub;

  const domain = process.env.AUTH0_TENANT_DOMAIN;
  const clientId = process.env.AUTH0_M2M_CLIENT_ID;
  const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

  try {
    // 1) Obtain a Management API token using client_credentials.
    const tokenRes = await axios.post(`https://${domain}/oauth/token`, {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
    });
    const mgmtToken = tokenRes.data.access_token;

    // 2) Request Auth0 to re-send a verification email.
    await axios.post(
      `https://${domain}/api/v2/jobs/verification-email`,
      { user_id: userSub },
      {
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
        },
      },
    );
    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.error(
      "Resend verification error:",
      error.response?.data || error.message,
    );
    return res.status(500).json({ error: "Failed to send verification email" });
  }
}
