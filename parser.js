var parseCommonMark = require('commonmark-to-commonform')
var parseMarkup = require('commonform-markup-parse')

module.exports = function (formData, format, callback) {
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
      return callback(error)
    }
    return callback(null, parsed.form, parsed.directions)
  }
}
