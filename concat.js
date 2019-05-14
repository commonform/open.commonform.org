module.exports = function (stream, limit, callback) {
  var chunks = []
  var bytesReceived = 0
  stream
    .on('data', function (chunk) {
      chunks.push(chunk)
      bytesReceived += chunk.length
      if (bytesReceived > limit) {
        stream.destroy()
        respond(new Error('limit'))
      }
    })
    .once('error', function (error) {
      respond(error)
    })
    .once('end', function () {
      respond(null, Buffer.concat(chunks))
    })

  function respond (error, value) {
    if (callback) callback(error, value)
    callback = null
  }
}
