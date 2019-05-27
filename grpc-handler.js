var parseForm = require('./parser')
var renderers = require('./renderers')
var numberings = require('./numberings')

const docxMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const Extract = async (call) => {
  return new Promise((resolve, reject) => {
    parseForm(call.request.data.toString('utf8'), call.request.meta.format, (error, _, blanks) => {
      if (error) {
        reject(error)
      } else {
        let result = { blanks: [] }
        for (var b of blanks) {
          result.blanks.push(b.label)
        };
        resolve(result)
      }
    })
  })
}

const Assemble = async (call) => {
  return new Promise((resolve, reject) => {
    parseForm(call.request.document.data.toString('utf8'), call.request.document.meta.format, (error, form, directions) => {
      if (error) {
        reject(error)
      } else {
        try {
          // Set renderer
          var renderer = renderers[call.request.format]

          // Process easy rendering options.
          var options = {}
          var passthroughOptionKeys = [
            'title', 'hash', 'indentMargins', 'leftAlignTitle', 'markFilled', 'unfilledBlanks'
          ]
          passthroughOptionKeys.forEach(function (key) {
            if (call.request[key]) {
              options[key] = call.request[key]
            }
          })

          // Process styles =>
          // we current send the styles in as a JSON string. see comments in
          // commonform.proto for reasoning as such, we need to make sure it's
          // not an empty buffer before we call JSON.parse or else node will
          // panic on us here.
          if (call.request.styles.length !== 0) {
            options['styles'] = JSON.parse(call.request.styles.toString('utf8'))
          }

          // Process numbering.
          options.numbering = numberings[call.request.numbering]

          // Process blanks =>
          // Note that blanks are handled slightly differently by the GRPC server.
          // See commonform.proto for how to send blanks in.
          var blanks = {}
          if (call.request.blanks.length !== 0) {
            for (var b of call.request.blanks) {
              blanks[b.name] = b.value
            }
          };
          if (directions && !Array.isArray(blanks)) {
            blanks = Object.keys(blanks).reduce(function (output, key) {
              directions
                .filter(function (direction) {
                  return direction.label === key
                })
                .forEach(function (direction) {
                  output.push({
                    label: direction.label,
                    blank: direction.blank,
                    value: blanks[key]
                  })
                })
              return output
            }, [])
          }

          // Process signatures =>
          // TODO: how to handle this when the info is known?
          if (call.request.format === 'docx' && call.request.signatures) {
            options.after = require('ooxml-signature-pages')(call.request.signatures)
          }

          var rendered = renderer(form, blanks, options)
          var result = {
            meta: {
              name: call.request.document.meta.name,
              mime: docxMime
            },
            data: Buffer.from(rendered)
          }
          resolve(result)
        } catch (error) {
          reject(error)
        };
      };
    })
  })
}

module.exports = {
  Extract,
  Assemble
}
