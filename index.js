var AJV = require('ajv')
var lint = require('commonform-lint')
var parseMarkup = require('commonform-markup-parse')
var renderers = require('./renderers')
var simpleConcat = require('simple-concat')

var ajv = new AJV()
var validRenderRequest = ajv.compile(require('./schemas/render.json'))
var validLintRequest = ajv.compile(require('./schemas/lint.json'))

module.exports = function (request, response) {
  simpleConcat(request, function (error, body) {
    /* istanbul ignore if */
    if (error) return serverError(error)

    // Parse JSON.
    try {
      var parsedRequest = JSON.parse(body)
    } catch (error) {
      return clientError('invalid json')
    }

    if (request.method === 'POST') {
      // Route request.
      if (validRenderRequest(parsedRequest)) {
        return handleRender(parsedRequest, response)
      } else if (validLintRequest(parsedRequest)) {
        return handleLint(parsedRequest, response)
      } else {
        return clientError('invalid request')
      }
    } else {
      response.statusCode = 302
      response.setHeader('Location', 'https://github.com/commonform/open.commonform.org')
      response.end()
    }
  })

  function handleRender (request, response) {
    parseForm(request, function (error, form) {
      if (error) return clientError(error)
      var renderer = renderers[request.format]
      /* istanbul ignore next */
      if (!renderer) return clientError('unknown format')
      var rendered = renderer(form)
      response.statusCode = 200
      response.end(rendered)
    })
  }

  function handleLint (request, response) {
    parseForm(request, function (error, form) {
      if (error) return clientError(error)
      try {
        var results = lint(form)
      } catch (error) {
        return serverError(error)
      }
      response.statusCode = 200
      response.end(JSON.stringify(results))
    })
  }

  function parseForm (request, callback) {
    var form
    var formData = request.form.data
    /* istanbul ignore else */
    if (request.form.format === 'json') {
      try {
        form = JSON.parse(formData)
        return callback(null, form)
      } catch (error) {
        return callback(new Error('invalid form JSON'))
      }
    } else if (request.form.format === 'markup') {
      try {
        form = parseMarkup(formData).form
        return callback(null, form)
      } catch (error) {
        return callback(new Error('invalid form markup'))
      }
    }
  }

  /* istanbul ignore next */
  function serverError (error) {
    request.log.error(error)
    response.statusCode = 500
    response.end(error.toString())
  }

  function clientError (error) {
    request.log.info(error)
    response.statusCode = 400
    response.end(error.toString())
  }
}
