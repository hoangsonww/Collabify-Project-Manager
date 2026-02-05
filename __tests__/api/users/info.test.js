const { createMocks } = require("node-mocks-http");
const handler = require("../../../pages/api/users/info").default;
const axios = require("axios");
jest.mock("axios");

it("400 without user id", async () => {
  const { req, res } = createMocks({ query: {} });
  await handler(req, res);
  expect(res._getStatusCode()).toBe(400);
});
