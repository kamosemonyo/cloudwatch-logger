const cloudwatch = require('../cloudwatchlog')
const assert = require('assert')

describe('CloudWatch unit tests', function () {
  const githubevent = {
    author: {
      name: 'git'
    },
    repository: {
      name: 'git-test',
      branch: 'master'
    }
  }

  it('formatData empty logGroupName throws exception', function () {
    try {
      cloudwatch.formatData({
        logStreamName: 'COMMITS',
        data: githubevent
      })

    } catch (error) {
      assert.deepStrictEqual(
        error.message,
        'invalid logGroupName provided expected string recieved undefined'
      )
    }
  })

  it('formatData logGroupName none string throws exception', function () {
    try {
      cloudwatch.formatData({
        logGroupName: 123,
        logStreamName: 'COMMITS',
        data: githubevent
      })

    } catch (error) {
      assert.deepStrictEqual(
        error.message,
        'invalid logGroupName provided expected string recieved number'
      )
    }
  })

  it('formatData logGroupName empty string throws exception', function () {
    try {
      cloudwatch.formatData({
        logGroupName: '',
        logStreamName: 'COMMITS',
        data: githubevent
      })

    } catch (error) {
      assert.deepStrictEqual(
        error.message,
        'empty logGroupName provided'
      )
    }
  })

  it('formatData empty logStreamName throws exception', function () {
    try {
      cloudwatch.formatData({
        logGroupName: 'GITHUB_EVENTS',
        data: githubevent
      })

    } catch (error) {
      assert.deepStrictEqual(
        error.message,
        'invalid logStreamName provided expected string recieved undefined'
      )
    }
  })

  it('formatData logStreamName none string throws exception', function () {
    try {
      cloudwatch.formatData({
        logGroupName: 'GITHUB_EVENTS',
        logStreamName: 123,
        data: githubevent
      })

    } catch (error) {
      assert.deepStrictEqual(
        error.message,
        'invalid logStreamName provided expected string recieved number'
      )
    }
  })

  it('formatData logStreamName empty string throws exception', function () {
    try {
      cloudwatch.formatData({
        logGroupName: 'GITHUB_EVENTS',
        logStreamName: '',
        data: githubevent
      })

    } catch (error) {
      assert.deepStrictEqual(
        error.message,
        'empty logStreamName provided'
      )
    }
  })

  it('formatData data empty string throws exception', function () {
    try {
      cloudwatch.formatData({
        logGroupName: 'GITHUB_EVENTS',
        logStreamName: 'COMMITS'
      })

    } catch (error) {
      assert.deepStrictEqual(
        error.message,
        'invalid event data provided expected object recieved undefined'
      )
    }
  })

  it('formatData data empty string throws exception', function () {
    try {
      cloudwatch.formatData({
        logGroupName: 'GITHUB_EVENTS',
        logStreamName: 'COMMITS',
        data: {}
      })

    } catch (error) {
      assert.deepStrictEqual(
        error.message,
        'empty event data provided'
      )
    }
  })

  it('formatData returns expected data type', function () {
    const data = cloudwatch.formatData({
      logGroupName: 'GITHUB_EVENTS',
      logStreamName: 'COMMITS',
      data: githubevent
    })

    assert.deepStrictEqual(data.logGroupName, 'GITHUB_EVENTS')
    assert.deepStrictEqual(data.logStreamName, 'COMMITS')
    assert.deepStrictEqual(data.logEvents.length, 1)
    assert.deepStrictEqual(Number.isInteger(data.logEvents[0].timestamp), true)
    assert.deepStrictEqual(data.logEvents[0].message, JSON.stringify(githubevent))
  })

  it('write method calls putLogEvents of type promise', async function () {
    const data = cloudwatch.formatData({
      logGroupName: 'GITHUB_EVENTS',
      logStreamName: 'COMMITS',
      data: githubevent
    })

    const client = cloudWatchLogMock()
    await cloudwatch.save(data, client)
    assert.strictEqual(client.promisecall, 2)
  })

  it('write method data is set correctly', async function () {
    const data = cloudwatch.formatData({
      logGroupName: 'GITHUB_EVENTS',
      logStreamName: 'COMMITS',
      data: githubevent
    })

    const client = cloudWatchLogMock()
    await cloudwatch.save(data, client)
    assert.deepStrictEqual(client.data, data)
  })

  it('write returns error data object', async function () {
    const data = cloudwatch.formatData({
      logGroupName: 'GITHUB_EVENTS',
      logStreamName: 'COMMITS',
      data: githubevent
    })

    const client = cloudWatchLogMock()
    const response = await cloudwatch.save(data, client)
    assert.deepStrictEqual(response, { error: null, data: {} })
  })

  it('write on error returns data is null', async function () {
    const data = cloudwatch.formatData({
      logGroupName: 'GITHUB_EVENTS',
      logStreamName: 'COMMITS',
      data: githubevent
    })

    const client = cloudWatchLogMock(true)
    const response = await cloudwatch.save(data, client)
    assert.deepStrictEqual(response, { error: {}, data: null })
  })
})

function cloudWatchLogMock (fail = false) {
  const mock = {}
  mock.promisecall = 0
  mock.$response = {
    error: (fail) ? {} : null,
    data: (fail) ? null : {}
  }
  mock.logStreams = [
    { uploadSequenceToken: ''}
  ]

  mock.putLogEvents = function (data) {
    mock.data = data
    return mock
  }

  mock.describeLogStreams = function (data) {
    mock.describe = data
    return mock
  }

  mock.promise = async function () {
    mock.promisecall++
    return mock
  }

  return mock
}