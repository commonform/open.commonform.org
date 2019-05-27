var handler = require('./http-handler')
var http = require('http')

module.exports = function (httpLogger) {
  return http.createServer(function (request, response) {
    httpLogger(request, response)
    handler(request, response)
  })
}
