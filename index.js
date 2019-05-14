var AJV = require('ajv')
var parseMarkup = require('commonform-markup-parse')
var renderers = require('./renderers')
var simpleConcat = require('simple-concat')

var ajv = new AJV()
var validRenderRequest = ajv.compile(require('./schemas/render.json'))

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

    // Validate request.
    if (validRenderRequest(parsedRequest)) {
      return render(parsedRequest, response)
    }
    return clientError('invalid request')
  })

  function render (request, response) {
    // Parse form.
    var form
    var formData = request.form.data
    /* istanbul ignore else */
    if (request.form.format === 'json') {
      try {
        form = JSON.parse(formData)
      } catch (error) {
        return clientError('invalid form JSON')
      }
    } else if (request.form.format === 'markup') {
      try {
        form = parseMarkup(formData).form
      } catch (error) {
        return clientError('invalid form markup')
      }
    }

    // Render form.
    var renderer = renderers[request.format]
    /* istanbul ignore next */
    if (!renderer) return clientError('unknown format')
    var rendered = renderer(form)

    response.statusCode = 200
    response.end(rendered)
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
