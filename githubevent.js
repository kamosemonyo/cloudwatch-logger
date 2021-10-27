
exports.filterData = function (eventData, filterSchema) {
  validateEventData(eventData)
  validateFilterSchema(filterSchema)

  return filterEventData(eventData, filterSchema)
}

function filterEventData (source, filterObj) {
  const filteredData = {}

  Object.keys(filterObj)
    .filter((key) => key in source)
    .forEach((key) => {
      if (typeof source[key] === 'object' &&  typeof filterObj[key] === 'object') {
        filteredData[key] = filterEventData(source[key], filterObj[key])
      } else {
        filteredData[key] = source[key]
      }
    })

  return filteredData
}

function validateEventData (eventData) {
  if (typeof eventData !== 'object') {
    const type = typeof eventData
    throw Error(`invalid github event provided expected object recieved ${type}`)
  }

  if (Object.keys(eventData).length <= 0) {
    throw Error('empty github event data provided')
  } 
}

function validateFilterSchema (filterSchema) {
  if (typeof filterSchema !== 'object') {
    const type = typeof filterSchema
    throw Error(`invalid filterSchema provided expected object recieved ${type}`)
  }

  if (Object.keys(filterSchema).length <= 0) {
    throw Error('empty filterSchema data provided')
  }
}