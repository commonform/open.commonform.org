module.exports = {
  type: 'object',
  properties: {
    action: { const: 'render' },
    format: {
      enum: ['docx', 'html', 'html5', 'markdown']
    },
    form: require('./form'),
    numbering: { enum: ['decimal', 'outline'] },
    directions: { type: 'array' },
    blanks: {
      oneOf: [
        { type: 'object' },
        { type: 'array' }
      ]
    },
    styles: { type: 'object' },
    title: {
      title: 'optional document title',
      type: 'string'
    }
  },
  required: ['action', 'form']
}
