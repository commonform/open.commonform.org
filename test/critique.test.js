var http = require('http')
var simpleConcat = require('simple-concat')
var tape = require('tape')
var withTestServer = require('./with-test-server')

tape('critique archaism', function (test) {
  var request = {
    action: 'critique',
    form: {
      format: 'json',
      data: JSON.stringify({ content: ['to wit'] })
    }
  }
  var result = {
    message: 'The phrase "to wit" is archaic.',
    level: 'info',
    path: ['content', 0],
    source: 'commonform-archaic',
    url: null
  }
  withTestServer(function (port, close) {
    http.request({ port, method: 'POST' })
      .once('response', function (response) {
        simpleConcat(response, function (error, buffer) {
          test.ifError(error)
          test.deepEqual(JSON.parse(buffer)[0], result)
          close()
          test.end()
        })
      })
      .end(JSON.stringify(request))
  })
})

tape('critique invalid form', function (test) {
  var request = {
    action: 'critique',
    form: {
      format: 'json',
      data: 'invalid JSON'
    }
  }
  withTestServer(function (port, close) {
    http.request({ port, method: 'POST' })
      .once('response', function (response) {
        test.equal(response.statusCode, 400, '400')
        close()
        test.end()
      })
      .end(JSON.stringify(request))
  })
})
