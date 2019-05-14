var http = require('http')
var simpleConcat = require('simple-concat')
var tape = require('tape')
var withTestServer = require('./with-test-server')

tape('broken reference', function (test) {
  var request = {
    action: 'lint',
    form: {
      format: 'json',
      data: JSON.stringify({
        content: [ { reference: 'Indemnity' } ]
      })
    }
  }
  var results = [
    {
      message: 'The heading "Indemnity" is referenced, but not used.',
      level: 'error',
      path: ['content', 0],
      source: 'commonform-lint',
      url: null
    }
  ]
  withTestServer(function (port, close) {
    http.request({ port, method: 'POST' })
      .once('response', function (response) {
        simpleConcat(response, function (error, buffer) {
          test.ifError(error)
          test.deepEqual(JSON.parse(buffer), results)
          close()
          test.end()
        })
      })
      .end(JSON.stringify(request))
  })
})
