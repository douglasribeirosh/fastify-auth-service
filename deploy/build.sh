#!/bin/bash
#Execute from folder this folder
##bash build.sh

IMAGE_NAME="dsh-fastify-auth-api/web"
IMAGE_VERSION=`git show HEAD --pretty=format:"%h" --no-patch`
NODE_VERSION=16.15.1
NPM_VERSION=8.12.2
PORT=8080
DATABASE_URL="file:./dev.db"

docker build .. -f app/Dockerfile \
  --target app\
  --tag $IMAGE_NAME:$IMAGE_VERSION \
  --build-arg IMAGE_VERSION=$IMAGE_VERSION \
  --build-arg NODE_VERSION=$NODE_VERSION \
  --build-arg NPM_VERSION=$NPM_VERSION \
  --build-arg PORT=$PORT \
  --build-arg DATABASE_URL=$DATABASE_URL

docker tag $IMAGE_NAME:$IMAGE_VERSION $IMAGE_NAME

