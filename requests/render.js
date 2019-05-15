module.exports = {
  'type': 'object',
  'properties': {
    'action': {
      'const': 'render'
    },
    'format': {
      'enum': [
        'docx',
        'html',
        'html5',
        'markdown'
      ]
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
    },
    'numbering': {
      'enum': [
        'decimal',
        'outline'
      ]
    },
    'directions': {
      'type': 'array'
    },
    'blanks': {
      'oneOf': [
        {
          'type': 'object'
        },
        {
          'type': 'array'
        }
      ]
    },
    'styles': {
      'type': 'object'
    },
    'title': {
      'title': 'optional document title',
      'type': 'string'
    }
  },
  'required': [
    'action',
    'form'
  ]
}
