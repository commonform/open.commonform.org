var http = require('http')
var tape = require('tape')
var withTestServer = require('./with-test-server')

tape('redirect', function (test) {
  withTestServer(function (port, close) {
    http.request({ port, method: 'GET' })
      .once('response', function (response) {
        test.equal(response.statusCode, 302, '302')
        test.assert(response.headers.location.length > 0)
        close()
        test.end()
      })
      .end()
  })
})
