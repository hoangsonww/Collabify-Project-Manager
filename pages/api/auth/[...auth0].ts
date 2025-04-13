import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

/**
 * This API route handles the login process for users.
 */
export default handleAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async login(req: any, res: any) {
    try {
      // Redirect to /dashboard after login.
      await handleLogin(req, res, { returnTo: "/dashboard" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(error.status || 500).end(error.message);
    }
  },
});
