const core = require('@actions/core')
const github = require('@actions/github')
const log = require('./log')
const githubevent = require('./githubevent')
const cloudwatchlog = require('./cloudwatchlog')

async function run () {
  try {
    const filterKeys = JSON.parse(core.getInput('filter-keys'))
    const logGroupName = core.getInput('log-group-name')
    const logStreamName = core.getInput('log-stream-name')
  
    const eventData = githubevent.filterData(
      github.context.payload, filterKeys
    )
  
    const logData = cloudwatchlog.formatData({
      logGroupName: logGroupName,
      logStreamName: logStreamName,
      data: eventData
    })
  
    const response = await log.save(logData, cloudwatchlog)
  
    if (response.error) {
      core.setFailed(JSON.stringify(response.error))
    } else {
      console.log(JSON.stringify(response.data))
    }
  } catch (error) {
    core.setFailed(error.message)
  } finally {
    console.log(`The event payload: ${JSON.stringify(github.context.payload)}`)
  }
}

run()