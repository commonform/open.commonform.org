var handler = require('../')
var http = require('http')
var pino = require('pino')
var pinoHTTP = require('pino-http')

var RANDOM_HIGH_PORT = 0

module.exports = function (callback) {
  var serverLog = pino({ enabled: false })
  var logger = pinoHTTP({ logger: serverLog })
  var server = http.createServer(function (request, response) {
    logger(request, response)
    handler(request, response)
  })
  server.listen(RANDOM_HIGH_PORT, function () {
    callback(server.address().port, function () {
      server.close()
    })
  })
}
