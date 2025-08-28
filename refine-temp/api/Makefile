GOOS   ?= linux
GOARCH ?= amd64

build-AppFunction:
	mkdir -p $(ARTIFACTS_DIR)
	GOOS=$(GOOS) GOARCH=$(GOARCH) CGO_ENABLED=0 \
	go build -tags lambda.norpc -trimpath -ldflags="-s -w" \
	  -o $(ARTIFACTS_DIR)/bootstrap ./cmd/lambda

clean-AppFunction:
	rm -f $(ARTIFACTS_DIR)/bootstrap