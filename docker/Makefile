BIN_NAME ?= pyflow
IMAGE_NAME ?= $(BIN_NAME):latest
VERSION ?= 0.2
DOCKER_ID_USER ?= naughtytao

docker: Dockerfile
	docker build --no-cache -t $(IMAGE_NAME) .

push:
	docker tag $(IMAGE_NAME) ${DOCKER_ID_USER}/$(BIN_NAME)
	docker push ${DOCKER_ID_USER}/$(BIN_NAME)