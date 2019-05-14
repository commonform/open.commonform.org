var AJV = require('ajv')
var lint = require('commonform-lint')
var numberings = require('./numberings')
var parseMarkup = require('commonform-markup-parse')
var renderers = require('./renderers')
var simpleConcat = require('simple-concat')

var ajv = new AJV()
var validRenderRequest = ajv.compile(require('./requests/render.schema.json'))
var validLintRequest = ajv.compile(require('./requests/lint.schema.json'))

module.exports = function (request, response) {
  if (request.method === 'POST') {
    simpleConcat(request, function (error, body) {
      /* istanbul ignore if */
      if (error) return serverError(error)

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
    })
  } else {
    response.statusCode = 302
    response.setHeader('Location', 'https://github.com/commonform/open.commonform.org')
    response.end()
  }

  function handleRender (request, response) {
    parseForm(request, function (error, form, directions) {
      if (error) return clientError(error)
      // Validate renderer.
      var renderer = renderers[request.format]
      /* istanbul ignore next */
      if (!renderer) return clientError('unknown format')

      // Compile rendering options.
      var options = {}
      var passthroughOptionKeys = [
        'title', 'edition', 'hash', 'markFilled', 'styles'
      ]
      passthroughOptionKeys.forEach(function (key) {
        if (request[key]) options[key] = request[key]
      })

      // Process blanks.
      if (request.directions) directions = request.directions
      var blanks = request.blanks || []
      if (directions && !Array.isArray(blanks)) {
        blanks = Object.keys(blanks).reduce(function (output, key) {
          var value = blanks[key]
          directions
            .filter(function (direction) {
              return direction.identifier === key
            })
            .forEach(function (direction) {
              output.push({
                blank: direction.path,
                value: value
              })
            })
          return output
        }, [])
      }

      // Process numbering.
      var numbering = request.numbering
      if (numbering) {
        if (!numberings.hasOwnProperty(numbering)) {
          return clientError('unknown numbering')
        }
        options.numbering = numberings[numbering]
      } else {
        options.numbering = numberings.default
      }

      // Render.
      try {
        var rendered = renderer(form, blanks, options)
      } catch (error) {
        /* istanbul ignore next */
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
        /* istanbul ignore next */
        return serverError(error)
      }
      response.statusCode = 200
      response.end(JSON.stringify(results))
    })
  }

  function parseForm (request, callback) {
    var formData = request.form.data
    /* istanbul ignore else */
    if (request.form.format === 'json') {
      try {
        var form = JSON.parse(formData)
      } catch (error) {
        return callback(new Error('invalid form JSON'))
      }
      return callback(null, form)
    } else if (request.form.format === 'markup') {
      try {
        var parsed = parseMarkup(formData)
      } catch (error) {
        return callback(new Error('invalid form markup'))
      }
      return callback(null, parsed.form, parsed.directions)
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
