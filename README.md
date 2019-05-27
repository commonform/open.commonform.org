# CommonForm Engine (as a Server)

This repository provides a daemon engine that wraps some of the most oft used [Common Form](https://github.com/commonform) utilities.

The daemon is designed to be operated as a standalone [Docker](./Dockerfile) container that just runs within a server farm or cluster.

The engine exposes two servers for users:

1. the first is a REST-like HTTP server that accepts POST routes with a JSON body. See [the `requests` directory](./requests) for JSON Schemas of various valid request payloads.
2. the second is a [GRPC](https://grpc.io) server which accepts inbound requests via the [protobuf standard file](./requests/commonform.proto).

## Install

There are two ways to install the engine within your system.

The first is to clone the repository, build the Docker image, push to a repository, and then to turn it on via the instructions below.

The second is to leverage the auto-built Docker images [CSK TODO](#todo) within your cluster.

## Operate

The engine can be operated via node.js on metal with `npm start` although it has been primarily built to operate in a cluster via the Docker image.

The configuration of the engine is handled via environment variables:

| **Variable** | **Notes** | **Default** |
|------------|--------|------------------|
| `LOG_LEVEL` | Log level for the server(s) | `info` |
| `ENABLE_HTTP_SERVER` | Turns on the HTTP server | `true` |
| `HTTP_SERVER_HOST` | Host the HTTP server should listen on (generally this should be blank unless you really know what you're doing) | `127.0.0.1` |
| `HTTP_SERVER_PORT` | Port the HTTP server should listen on | `8080` |
| `ENABLE_GRPC_SERVER` | Turns on the GRPC server | `true` |
| `GRPC_SERVER_HOST` | Host the GRPC server should listen on (generally this should be blank unless you really know what you're doing) | `127.0.0.1` |
| `GRPC_SERVER_PORT` | Port the GRPC server should listen on | `8081` |

## TODOs

- [ ] auto-build docker image
- [ ] golang client
