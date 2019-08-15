module.exports = {
  type: 'object',
  properties: {
    action: { const: 'critique' },
    form: require('./form')
  },
  required: ['action', 'form']
}
