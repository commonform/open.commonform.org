var docx = require('commonform-docx')
var html = require('commonform-html')
var markdown = require('commonform-markdown')

module.exports = {
  html: wrapSynchronousRenderer(html),

  markdown: wrapSynchronousRenderer(markdown),

  html5: function (form, blanks, options, callback) {
    options = options || {}
    options.html5 = true
    try {
      var rendered = html(form, blanks, options)
    } catch (error) {
      return callback(error)
    }
    callback(null, rendered)
  },

  docx: function (form, blanks, options, callback) {
    var rendered = docx(form, blanks, options)
    return rendered
      .generateAsync({ type: 'nodebuffer' })
      .catch(callback)
      .then(function (buffer) {
        callback(null, buffer)
      })
  }
}

function wrapSynchronousRenderer (renderer) {
  return function (form, blanks, options, callback) {
    try {
      var rendered = renderer(form, blanks, options)
    } catch (error) {
      return callback(error)
    }
    callback(null, rendered)
  }
}
