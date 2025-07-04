const { createMocks } = require('node-mocks-http')
const handler = require('../../../pages/api/users/roles').default
const axios   = require('axios')
jest.mock('axios')

it('400 without sub', async () => {
  const { req, res } = createMocks({ query: {} })
  await handler(req, res)
  expect(res._getStatusCode()).toBe(400)
})
