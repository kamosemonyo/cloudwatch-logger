const githubevent = require('../githubevent')
const assert = require('assert')

describe('GitHubEvent unit tests', function () {
  it('none object fullData parameter throws exception', function () {
    try {
      githubevent.filterData('', [])
    } catch (error) {
      assert.strictEqual(
        error.message,
        'invalid github event provided expected object recieved string'
      )
    }
  })

  it('empty object fullData parameter throws exception', function () {
    try {
      githubevent.filterData({}, [])
    } catch (error) {
      assert.strictEqual(
        error.message,
        'empty github event data provided'
      )
    }
  })

  it('none object filterSchema parameter throws exception', function () {
    try {
      githubevent.filterData({ author: '' }, '')
    } catch (error) {
      assert.strictEqual(
        error.message,
        'invalid filterSchema provided expected object recieved string'
      )
    }
  })

  it('empty array filterSchema parameter throws exception', function () {
    try {
      githubevent.filterData({ author: '' }, {})
    } catch (error) {
      assert.strictEqual(
        error.message,
        'empty filterSchema data provided'
      )
    }
  })

  it('none existing filterKey values throws exception', function () {
    try {
      githubevent.filterData({ author: '' }, { authors: '' })
    } catch (error) {
      assert.strictEqual(
        error.message,
        'unsupported key authors provided'
      )
    }
  })

  it('correct input returns filtered object', function () {
    const actual = githubevent.filterData(
      { author: 'git', command: 'push' }, { author: '' }
    )
    assert.deepStrictEqual(actual, { author: 'git' })
  })

  it('nested object support', function () {
    const actual = githubevent.filterData(
    { 
      author: {
        name: 'git', email: 'mail.com', tel: '' 
      },
      command: 'push' 
    },
    {
      author: { email: '' }
    })
    assert.deepStrictEqual(actual, { author: { email: 'mail.com' } })
  })
})