const log = require('../log')
const assert = require('assert')

describe('log unit tests', function () {
  it('write calls client write', async function () {
    const client = clientMock()
    await log.save({ authors: ''}, client)
    assert.strictEqual(client.savecalls, 1)
  })
})

function clientMock () {
  const client = {}
  client.savecalls = 0
  client.formatcalls = 0

  client.save = async function (data) {
    client.savecalls++
  }

  return client
}