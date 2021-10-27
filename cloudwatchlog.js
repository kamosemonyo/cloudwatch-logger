const AWS = require('aws-sdk')
AWS.config.update({
  region: process.env.AWS_REGION || '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET_KEY || ''
  }
})

exports.save = async function (data, client = getClient()) {
  try {
    const token = await getSequenceToken(data.logGroupName, client)
    console.log(token)
    if (typeof token === 'string') {
      data.sequenceToken = token
    }

    return await saveLog(data, client)
  } catch (error) {
    return toIOResponse(error, null)
  }
}

async function getSequenceToken (logGroupName, client) {
  validateLogGroupName(logGroupName)

  try {

    const response = await client.describeLogStreams({
      logGroupName: logGroupName
    }).promise()

    return response.logStreams[0].uploadSequenceToken

  } catch (error) {
    throw Error(error.message)
  }
}

async function saveLog(data, client) {
  try {
    const response = await client.putLogEvents(data).promise()

    if (response.$response.error) {
      return toIOResponse(response.$response.error, null)
    }

    return toIOResponse(null, response.$response.data)
  } catch (error) {
    console.log(error)
    return toIOResponse(error, null)
  }
}

function getClient() {
  return new AWS.CloudWatchLogs()
}

function toIOResponse(error, data) {
  return {
    error: error,
    data: data
  }
}

exports.formatData = function ({ logGroupName, logStreamName, data }) {
  validateLogGroupName(logGroupName)
  validateLogStreamName(logStreamName)
  validateData(data)

  const inputLogEvent = toInputLogEvent(data)

  return {
    logEvents: [inputLogEvent],
    logGroupName: logGroupName,
    logStreamName: logStreamName
  }
}

function validateLogGroupName(logGroupName) {
  if (typeof logGroupName !== 'string') {
    const type = typeof logGroupName
    Error(`invalid logGroupName provided expected string recieved ${type}`)
  }

  if (logGroupName === '') {
    Error(`empty logGroupName provided`)
  }
}

function validateLogStreamName(logStreamName) {
  if (typeof logStreamName !== 'string') {
    const type = typeof logStreamName
    Error(`invalid logStreamName provided expected string recieved ${type}`)
  }

  if (logStreamName === '') {
    Error(`empty logStreamName provided`)
  }
}

function validateData(data){
  if (typeof data !== 'object') {
    const type = typeof data
    throw Error(`invalid event data provided expected object recieved ${type}`)
  }

  if (Object.keys(data).length <= 0) {
    throw Error(`empty event data provided`)
  }
}

function toInputLogEvent (data) {
  if (typeof data !== 'object') {
    throw Error(`None object value provided for inputLogEvent data ${data}`)
  }

  return {
    message: JSON.stringify(data),
    timestamp: new Date().getTime()
  }
}