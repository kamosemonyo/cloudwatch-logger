
exports.save = async function (data, client) {
  const response = await client.save(data)
  return response
}
