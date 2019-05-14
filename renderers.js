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

  markdown: require('commonform-markdown')
}
