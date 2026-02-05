const { createMocks } = require("node-mocks-http");
const handler = require("../../../pages/api/users/updateProfile").default;
jest.mock("@auth0/nextjs-auth0", () => ({ getSession: jest.fn() }));

it("401 when not logged in", async () => {
  require("@auth0/nextjs-auth0").getSession.mockResolvedValue(null);
  const { req, res } = createMocks({ method: "GET" });
  await handler(req, res);
  expect(res._getStatusCode()).toBe(401);
});
