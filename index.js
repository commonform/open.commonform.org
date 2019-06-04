var AJV = require('ajv')
var URL = require('url')
var concat = require('./concat')
var critique = require('commonform-critique')
var lint = require('commonform-lint')
var numberings = require('./numberings')
var parseCommonMark = require('commonmark-to-commonform')
var parseMarkup = require('commonform-markup-parse')
var renderers = require('./renderers')

var ajv = new AJV()
var validRenderRequest = ajv.compile(require('./requests/render'))
var validLintRequest = ajv.compile(require('./requests/lint'))
var validCritiqueRequest = ajv.compile(require('./requests/critique'))

var POST_BODY_LIMIT = process.env.POST_BODY_LIMIT || 500000

module.exports = function (request, response) {
  if (request.method === 'POST') {
    // Parse JSON request body and route to handler.
    concat(request, POST_BODY_LIMIT, function (error, body) {
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
      } else if (validCritiqueRequest(parsedRequest)) {
        return handleCritique(parsedRequest, response)
      } else {
        return clientError('invalid request')
      }
    })
  } else {
    var parsed = URL.parse(request.url, false)
    if (parsed.pathname === '/robots.txt') {
      response.setHeader('Content-Type', 'text/plain; charset=us-ascii')
      response.end('User-agent: *\nDisallow: /\n')
      return
    }
    // Redirect to GitHub repository.
    response.statusCode = 302
    var repo = 'https://github.com/commonform/open.commonform.org'
    response.setHeader('Location', repo)
    response.end()
  }

  // Handler form render requests.
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
      renderer(form, blanks, options, function (error, rendered) {
        /* istanbul ignore if */
        if (error) return serverError(error)
        response.statusCode = 200
        response.end(rendered)
      })
    })
  }

  // Handle lint requests.
  function handleLint (request, response) {
    serveResults(lint, request, response)
  }

  // Handle critique requests.
  function handleCritique (request, response) {
    serveResults(critique, request, response)
  }

  function serveResults (compute, request, response) {
    parseForm(request, function (error, form) {
      if (error) return clientError(error)
      try {
        var results = compute(form)
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
    var format = request.form.format
    var parsed
    /* istanbul ignore else */
    if (format === 'json') {
      try {
        var form = JSON.parse(formData)
      } catch (error) {
        return callback(new Error('invalid form JSON'))
      }
      return callback(null, form)
    } else if (format === 'markup') {
      try {
        parsed = parseMarkup(formData)
      } catch (error) {
        return callback(new Error('invalid form markup'))
      }
      return callback(null, parsed.form, parsed.directions)
    } else if (format === 'commonmark') {
      try {
        parsed = parseCommonMark(formData)
      } catch (error) {
        return callback(new Error('invalid CommonMark form'))
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
