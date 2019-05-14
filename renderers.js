var docx = require('commonform-docx')
var html = require('commonform-html')

module.exports = {
  html: function (form, blanks, options) {
    return html(form, blanks, options)
  },

  html5: function (form, blanks, options) {
    options = options || {}
    options.html5 = true
    return html(form, blanks, options)
  },

  docx: function (form, blanks, options) {
    var rendered = docx(form, blanks, options)
    return rendered.generate({ type: 'nodebuffer' })
  },

  markdown: require('commonform-markdown')
}
