module.exports = {
  type: 'object',
  properties: {
    action: { const: 'lint' },
    form: require('./form')
  },
  required: [ 'action', 'form' ]
}
