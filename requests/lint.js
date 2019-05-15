module.exports = {
  'type': 'object',
  'properties': {
    'action': {
      'const': 'lint'
    },
    'form': {
      'title': 'form data',
      'type': 'object',
      'properties': {
        'format': {
          'title': 'form data format',
          'enum': [
            'commonmark',
            'json',
            'markup'
          ]
        },
        'data': {
          'title': 'form data',
          'type': 'string'
        }
      }
    }
  },
  'required': [
    'action',
    'form'
  ]
}
