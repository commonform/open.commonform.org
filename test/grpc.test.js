const tape = require('tape')
const path = require('path')
const { Extract, Assemble } = require('../grpc-handler')

const PROTO_PATH = path.join(__dirname, '..', 'requests', 'commonform.proto')
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })
const commonFormProto = grpc.loadPackageDefinition(packageDefinition).commonform

const host = 'localhost'
var server, client

// cleanup
tape.onFinish(function () {
  server.forceShutdown()
})

tape.onFailure(function () {
  server.forceShutdown()
  process.exit(1)
})

// primary document to test
var buf1 = Buffer.from('# Hello World!\n\n## When I came over to your house\n\nIt was amazingly, `from somewhere`!\n\nAnd... `then came raisins` and they, too, were amazing.', 'utf8')
var doc1 = { meta: { name: 'form1.md', mime: 'text/markdown', format: 'commonmark' }, data: buf1 }

// secondary document to test
var buf2 = Buffer.from('# Hello World!\n\n## In his hands\n\nhe has got the whole, `wide world` in his hands', 'utf8')
var doc2 = { meta: { name: 'form2.md', mime: 'text/html', format: 'commonmark' }, data: buf2 }

// tertiary document to test -- should throw
var buf3 = Buffer.from('# Hello World!\n\n## When I came over to your house\n\nIt was amazingly, `from somewhere`!\nAnd... `then came raisins` and they, too, were amazing.', 'utf8')
var doc3 = { meta: { name: 'form3.md', mime: 'text/anotherthing', format: 'commonmark' }, data: buf3 }

// supplemental stuff
var styles = Buffer.from('{"reference":{"underline":"single"}}')
var blanks = [
  {
    name: 'from somewhere',
    value: 'New YORK!!!!'
  }
]
var sigs = [
  {
    term: 'Contractor',
    name: 'John Doe',
    header: 'The parties agree that: ',
    information: ['date', 'address']
  },
  {
    term: 'Company',
    name: 'Jennifer Smith',
    samePage: true,
    entities: [{
      name: 'My Company, Inc.',
      form: 'corporation',
      jurisdiction: 'New Hampshire',
      by: 'Director'
    }]
  }
]

tape('should setup server', function (test) {
  async function Extractor (call, callback) {
    try {
      let result = await Extract(call)
      return callback(null, result)
    } catch (error) {
      return callback(error)
    }
  }

  async function Assembler (call, callback) {
    try {
      let result = await Assemble(call)
      return callback(null, result)
    } catch (error) {
      return callback(error)
    }
  }

  server = new grpc.Server()
  server.addService(commonFormProto.CommonFormEngine.service, {
    Extract: Extractor,
    Assemble: Assembler
  })

  server.bindAsync(host + ':0', grpc.ServerCredentials.createInsecure(), (error, portNumber) => {
    test.error(error, 'unexpected error setting up server')
    server.start()
    client = new commonFormProto.CommonFormEngine(host + ':' + portNumber, grpc.credentials.createInsecure())
    test.notEqual(client, undefined)
    test.notEqual(server, undefined)
    test.end()
  })
})

tape('should run an extract', async function (test) {
  client.Extract(doc1, function (error, response) {
    var exp1 = ['from somewhere', 'then came raisins']
    test.error(error, 'unexpected error during extraction')
    test.deepEqual(response.blanks, exp1)
    client.Extract(doc2, function (error, response) {
      var exp2 = ['wide world']
      test.error(error, 'unexpected error during extraction')
      test.deepEqual(response.blanks, exp2)
      client.Extract(doc3, function (error, response) {
        test.notEqual(error, null, 'unexpected lack of an error during extraction')
        test.deepEqual(response, undefined)
        test.end()
      })
    })
  })
})

tape('should run an assemble with all the things', async function (test) {
  client.Assemble({ document: doc1, styles: styles, blanks: blanks, signatures: sigs }, function (error, response) {
    var exp1 = { name: 'form1.md', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', format: 'commonmark' }
    test.error(error, 'unexpected error during assembly')
    test.deepEqual(response.meta, exp1)
    test.deepEqual(response.data.length, 67435)
    client.Assemble({ document: doc2, styles: styles, blanks: blanks, signatures: sigs }, function (error, response) {
      var exp2 = { name: 'form2.md', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', format: 'commonmark' }
      test.error(error, 'unexpected error during assembly')
      test.deepEqual(response.meta, exp2)
      test.deepEqual(response.data.length, 67231)
      client.Assemble({ document: doc3, styles: styles, blanks: blanks, signatures: sigs }, function (error, response) {
        test.notEqual(error, null, 'unexpected lack of an error during extraction')
        test.deepEqual(response, undefined)
        test.end()
      })
    })
  })
})

tape('should run an assemble with null styles', async function (test) {
  client.Assemble({ document: doc1, styles: null, blanks: blanks, signatures: sigs }, function (error, response) {
    var exp1 = { name: 'form1.md', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', format: 'commonmark' }
    test.error(error, 'unexpected error during assembly')
    test.deepEqual(response.meta, exp1)
    test.deepEqual(response.data.length, 67435)
    client.Assemble({ document: doc2, styles: null, blanks: blanks, signatures: sigs }, function (error, response) {
      var exp2 = { name: 'form2.md', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', format: 'commonmark' }
      test.error(error, 'unexpected error during assembly')
      test.deepEqual(response.meta, exp2)
      test.deepEqual(response.data.length, 67231)
      client.Assemble({ document: doc3, styles: null, blanks: blanks, signatures: sigs }, function (error, response) {
        test.notEqual(error, null, 'unexpected lack of an error during extraction')
        test.deepEqual(response, undefined)
        test.end()
      })
    })
  })
})

tape('should run an assemble with null blanks', async function (test) {
  client.Assemble({ document: doc1, styles: styles, blanks: null, signatures: sigs }, function (error, response) {
    var exp1 = { name: 'form1.md', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', format: 'commonmark' }
    test.error(error, 'unexpected error during assembly')
    test.deepEqual(response.meta, exp1)
    test.deepEqual(response.data.length, 67457)
    client.Assemble({ document: doc2, styles: styles, blanks: null, signatures: sigs }, function (error, response) {
      var exp2 = { name: 'form2.md', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', format: 'commonmark' }
      test.error(error, 'unexpected error during assembly')
      test.deepEqual(response.meta, exp2)
      test.deepEqual(response.data.length, 67231)
      client.Assemble({ document: doc3, styles: styles, blanks: null, signatures: sigs }, function (error, response) {
        test.notEqual(error, null, 'unexpected lack of an error during extraction')
        test.deepEqual(response, undefined)
        test.end()
      })
    })
  })
})

tape('should run an assemble with null signatures', async function (test) {
  client.Assemble({ document: doc1, styles: styles, blanks: blanks, signatures: null }, function (error, response) {
    var exp1 = { name: 'form1.md', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', format: 'commonmark' }
    test.error(error, 'unexpected error during assembly')
    test.deepEqual(response.meta, exp1)
    test.deepEqual(response.data.length, 64577)
    client.Assemble({ document: doc2, styles: styles, blanks: blanks, signatures: null }, function (error, response) {
      var exp2 = { name: 'form2.md', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', format: 'commonmark' }
      test.error(error, 'unexpected error during assembly')
      test.deepEqual(response.meta, exp2)
      test.deepEqual(response.data.length, 64373)
      client.Assemble({ document: doc3, styles: styles, blanks: blanks, signatures: null }, function (error, response) {
        test.notEqual(error, null, 'unexpected lack of an error during extraction')
        test.deepEqual(response, undefined)
        test.end()
      })
    })
  })
})
