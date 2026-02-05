const { createMocks } = require("node-mocks-http");
const handler = require("../../pages/api/openapi").default;
jest.mock("../../utils/openapiSpec", () => ({ ok: true }));

test("openapi returns spec", async () => {
  const { req, res } = createMocks();
  await handler(req, res);
  expect(res._getStatusCode()).toBe(200);
  expect(res._getJSONData()).toEqual({ ok: true });
});
