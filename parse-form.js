var parseMarkup = require('commonform-markup-parse')
var commonmark = require('commonform-commonmark')

module.exports = function (object, callback) {
  var formData = object.data
  var format = object.format
  var parsed
  /* istanbul ignore else */
  if (format === 'json') {
    try {
      parsed = JSON.parse(formData)
    } catch (error) {
      return callback(new Error('invalid form JSON'))
    }
    return callback(null, parsed)
  } else if (format === 'markup') {
    try {
      parsed = parseMarkup(formData)
    } catch (error) {
      return callback(new Error('invalid form markup'))
    }
    return callback(null, parsed.form, parsed.directions)
  } else if (format === 'commonmark') {
    try {
      parsed = commonmark.parse(formData)
    } catch (error) {
      return callback(new Error('invalid CommonMark form'))
    }
    return callback(null, parsed.form, parsed.directions)
  }
}
