// servers
var httpServer = require('./http-server')
var grpcServer = require('./grpc-server')

// logging
var pino = require('pino')
var pinoHTTP = require('pino-http')

// set log level
var logLevel = process.env.LOG_LEVEL || 'warn'
var serverLog = pino({
  level: logLevel
})

var httpS, grpcS

// gracefully shutdown
var trap = function () {
  serverLog.trace({ event: 'shutdown signal' })
  cleanup()
}
process.on('SIGTERM', trap)
process.on('SIGQUIT', trap)
process.on('SIGINT', trap)
process.on('uncaughtException', function (exception) {
  serverLog.error({ exception: exception })
  cleanup()
})

function cleanup () {
  httpS.close(function () {
    serverLog.trace({ event: 'http server gracefully shutdown' })
    grpcS.tryShutdown(function () {
      serverLog.trace({ event: 'grpc server gracefully shutdown' })
      serverLog.warn({ event: 'engine shutdown' })
      process.exit(0)
    })
  })
};

// turn on http server
var httpServerHost = process.env.HTTP_SERVER_HOST || '127.0.0.1'
var httpServerPort = process.env.HTTP_SERVER_PORT || 8080
var enablehttpServer = process.env.ENABLE_HTTP_SERVER || true
if (enablehttpServer) {
  serverLog.debug({ event: 'booting http server' })
  httpS = httpServer(pinoHTTP({ logger: serverLog }))
  httpS.listen(httpServerPort, httpServerHost, function () {
    serverLog.warn({ event: 'http server listening', host: httpServerHost, port: httpServerPort })
  })
};

// turn on grpc server
var grpcServerHost = process.env.GRPC_SERVER_HOST || '127.0.0.1'
var grpcServerPort = process.env.GRPC_SERVER_PORT || 8081
var enablegrpcServer = process.env.ENABLE_GRPC_SERVER || true
if (enablegrpcServer) {
  serverLog.debug({ event: 'booting grpc server' })
  grpcS = grpcServer(grpcServerHost, grpcServerPort, serverLog)
  grpcS.start()
  serverLog.warn({ event: 'grpc server listening', host: grpcServerHost, port: grpcServerPort })
};
