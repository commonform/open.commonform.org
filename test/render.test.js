var http = require('http')
var tape = require('tape')
var withTestServer = require('./with-test-server')

tape('simple markdown', function (test) {
  var text = 'tiny form text'
  strictEqual(
    {
      action: 'render',
      format: 'markdown',
      form: {
        format: 'json',
        data: JSON.stringify({
          content: [text]
        })
      }
    },
    text,
    test
  )
})

tape('markdown with heading', function (test) {
  strictEqual(
    {
      action: 'render',
      format: 'markdown',
      form: {
        format: 'json',
        data: JSON.stringify({
          content: [
            {
              heading: 'Test Heading',
              form: {
                content: ['form text']
              }
            }
          ]
        })
      }
    },
    [
      '# <a id="Test_Heading"></a>Test Heading',
      '',
      'form text'
    ].join('\n'),
    test
  )
})

tape('render HTML', function (test) {
  strictEqual(
    {
      action: 'render',
      format: 'html',
      form: {
        format: 'json',
        data: JSON.stringify({
          content: [
            {
              heading: 'Test Heading',
              form: {
                content: ['form text']
              }
            }
          ]
        })
      }
    },
    [
      '<div class="article">',
      '<div class="section">',
      '<h1>Test Heading</h1>',
      '<p>form text</p>',
      '</div>',
      '</div>'
    ].join(''),
    test
  )
})

tape('render HTML5', function (test) {
  strictEqual(
    {
      action: 'render',
      format: 'html5',
      form: {
        format: 'json',
        data: JSON.stringify({
          content: [
            {
              heading: 'Test Heading',
              form: {
                content: ['form text']
              }
            }
          ]
        })
      }
    },
    [
      '<article>',
      '<section>',
      '<h1>Test Heading</h1>',
      '<p>form text</p>',
      '</section>',
      '</article>'
    ].join(''),
    test
  )
})

tape('markup', function (test) {
  strictEqual(
    {
      action: 'render',
      format: 'markdown',
      form: {
        format: 'markup',
        data: '    \\Test Heading\\ form text'
      }
    },
    [
      '# <a id="Test_Heading"></a>Test Heading',
      '',
      'form text'
    ].join('\n'),
    test
  )
})

tape('invalid JSON', function (test) {
  withTestServer(function (port, close) {
    http.request({ port, method: 'POST' })
      .once('response', function (response) {
        test.equal(response.statusCode, 400, '400')
        close()
        test.end()
      })
      .end('invalid json')
  })
})

tape('invalid request', function (test) {
  withTestServer(function (port, close) {
    http.request({ port, method: 'POST' })
      .once('response', function (response) {
        test.equal(response.statusCode, 400, '400')
        close()
        test.end()
      })
      .end(JSON.stringify({ action: 'invalid' }))
  })
})

tape('render invalid markup', function (test) {
  withTestServer(function (port, close) {
    http.request({ port, method: 'POST' })
      .once('response', function (response) {
        test.equal(response.statusCode, 400, '400')
        close()
        test.end()
      })
      .end(JSON.stringify({
        action: 'render',
        form: {
          format: 'markup',
          data: '\\blah'
        }
      }))
  })
})

tape('render invalid JSON', function (test) {
  withTestServer(function (port, close) {
    http.request({ port, method: 'POST' })
      .once('response', function (response) {
        test.equal(response.statusCode, 400, '400')
        close()
        test.end()
      })
      .end(JSON.stringify({
        action: 'render',
        form: {
          format: 'json',
          data: 'invalid json'
        }
      }))
  })
})

function strictEqual (request, expected, test) {
  withTestServer(function (port, close) {
    http.request({ port, method: 'POST' })
      .once('response', function (response) {
        var chunks = []
        response
          .on('data', function (chunk) {
            chunks.push(chunk)
          })
          .once('error', function (error) {
            test.ifError(error)
          })
          .once('end', function () {
            var content = Buffer.concat(chunks).toString()
            test.strictEqual(content, expected, 'renders expected')
          })
        close()
        test.end()
      })
      .end(JSON.stringify(request))
  })
}

