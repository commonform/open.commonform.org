# To compile gRPC service also requires protobuf 3 and the protobuf go plugin.
# See http://www.grpc.io/docs/quickstart/go.html to get started.
#
export GO111MODULE := on
SHELL := /bin/bash
REPO := $(shell pwd)

# Protobuf generated go files
PROTO_FILES = $(shell find . -path ./node_modules -prune -o -type f -name '*.proto' -print)
PROTO_GO_FILES = $(patsubst %.proto, %.pb.go, $(PROTO_FILES))
PROTO_GO_FILES_REAL = $(shell find . -type f -name '*.pb.go' -print)

# --------------------------------------------------------------------
#
# Building & Installing & Generating
#
# --------------------------------------------------------------------
# Protobuffing
## compile scalia.proto interface definition
%.pb.go: %.proto
	protoc -I=requests --go_out=. $<

.PHONY: protobuf
protobuf: clean_protobuf $(PROTO_GO_FILES)
	@mv ./github.com/commonform/open.commonform.org/*.pb.go clients/golang
	@rm -rf ./github.com

.PHONY: clean_protobuf
clean_protobuf:
	@rm -f $(PROTO_GO_FILES_REAL)

.PHONY: protobuf_deps
protobuf_deps:
	@GO111MODULE=off go get -u github.com/golang/protobuf/protoc-gen-go
