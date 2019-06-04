var http = require('http')
var simpleConcat = require('simple-concat')
var tape = require('tape')
var withTestServer = require('./with-test-server')

tape('redirect', function (test) {
  withTestServer(function (port, close) {
    http.request({ port, method: 'GET', path: '/robots.txt' })
      .once('response', function (response) {
        test.equal(response.statusCode, 200, '200')
        simpleConcat(response, function (error, buffer) {
          var body = buffer.toString()
          test.ifError(error, 'no error')
          test.assert(body.includes('User-agent:'))
          test.assert(body.includes('Disallow:'))
          close()
          test.end()
        })
      })
      .end()
  })
})
