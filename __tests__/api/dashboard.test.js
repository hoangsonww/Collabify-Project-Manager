const { createMocks } = require("node-mocks-http");
const handler = require("../../pages/api/dashboard").default;
jest.mock("@auth0/nextjs-auth0", () => ({ getSession: jest.fn() }));
jest.mock("../../lib/mongodb", () => ({ dbConnect: jest.fn() }));
jest.mock("../../models/Project", () => ({
  find: jest.fn().mockReturnValue([]),
}));

it("returns 401 if unauthenticated", async () => {
  require("@auth0/nextjs-auth0").getSession.mockResolvedValue(null);
  const { req, res } = createMocks();
  await handler(req, res);
  expect(res._getStatusCode()).toBe(401);
});
