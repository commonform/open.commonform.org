var AJV = require('ajv')
var lint = require('commonform-lint')
var numberings = require('./numberings')
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

    if (request.method === 'POST') {
      // Parse JSON.
      try {
        var parsedRequest = JSON.parse(body)
      } catch (error) {
        return clientError('invalid json')
      }

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
      var blanks = []
      var options = {}
      var optionKeys = [
        'title', 'edition', 'hash', 'markFilled', 'styles'
      ]
      optionKeys.forEach(function (key) {
        if (request[key]) options[key] = request[key]
      })
      var numbering = request.numbering
      if (numbering) {
        if (!numberings.hasOwnProperty(numbering)) {
          return clientError('unknown numbering')
        }
        options.numbering = numberings[numbering]
      } else {
        options.numbering = numberings.default
      }
      try {
        var rendered = renderer(form, blanks, options)
      } catch (error) {
        return serverError(error)
      }
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
      } catch (error) {
        return callback(new Error('invalid form JSON'))
      }
      return callback(null, form)
    } else if (request.form.format === 'markup') {
      try {
        form = parseMarkup(formData).form
      } catch (error) {
        return callback(new Error('invalid form markup'))
      }
      return callback(null, form)
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
