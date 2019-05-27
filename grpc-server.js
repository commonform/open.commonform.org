const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const path = require('path')
const { Extract, Assemble } = require('./grpc-handler')

const PROTO_PATH = path.join(__dirname, 'requests', 'commonform.proto')
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

module.exports = function (host, port, serverLog) {
  async function Extractor (call, callback) {
    try {
      serverLog.info({
        event: 'inbound grpc call',
        function: 'extract',
        document_meta: call.request.meta,
        document_length: call.request.data.length
      })
      let result = await Extract(call)
      serverLog.info({
        event: 'grpc call complete',
        function: 'extract',
        extracted: result.blanks.length
      })
      return callback(null, result)
    } catch (error) {
      serverLog.error(error)
      return callback(error)
    }
  }

  async function Assembler (call, callback) {
    try {
      serverLog.info({
        event: 'inbound grpc call',
        function: 'assemble',
        document_meta: call.request.document.meta,
        document_length: call.request.document.data.length
      })
      let result = await Assemble(call)
      serverLog.info({
        event: 'grpc call complete',
        function: 'assemble',
        assembled: result.data.length
      })
      return callback(null, result)
    } catch (error) {
      serverLog.error(error)
      return callback(error)
    }
  }

  // Setup server
  grpc.setLogger(serverLog)
  var server = new grpc.Server()
  server.addService(commonFormProto.CommonFormEngine.service, {
    Extract: Extractor,
    Assemble: Assembler
  })

  server.bind(host + ':' + port, grpc.ServerCredentials.createInsecure())
  return server
}
