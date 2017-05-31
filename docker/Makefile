IMAGE_NAME ?= pyflow:latest
VERSION ?= 0.1

docker: Dockerfile
	docker build --no-cache -t $(IMAGE_NAME) .