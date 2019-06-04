var handler = require('./')
var http = require('http')
var pino = require('pino')
var pinoHTTP = require('pino-http')

var serverLog = pino()
var logger = pinoHTTP({ logger: serverLog })

var server = http.createServer(function (request, response) {
  logger(request, response)
  handler(request, response)
})

var trap = function () {
  serverLog.info({ event: 'signal' })
  cleanup()
}
process.on('SIGTERM', trap)
process.on('SIGQUIT', trap)
process.on('SIGINT', trap)
process.on('uncaughtException', function (exception) {
  serverLog.error(exception)
  cleanup()
})

var port = process.env.PORT || 8080
server.listen(port, function () {
  var boundPort = this.address().port
  serverLog.info({ event: 'listening', port: boundPort })
})

function cleanup () {
  server.close(function () {
    serverLog.info({ event: 'closed' })
    process.exit(0)
  })
}
