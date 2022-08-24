#!/bin/bash
#Execute from folder this folder
##bash build.sh

IMAGE_NAME="dsh-fastify-auth-api/web"
IMAGE_VERSION=`git show HEAD --pretty=format:"%h" --no-patch`
NODE_VERSION=16.15.1
NPM_VERSION=8.12.2
PORT=8080
docker build .. -f app/Dockerfile \
  --target app\
  --tag registry.heroku.com/$IMAGE_NAME:$IMAGE_VERSION \
  --build-arg IMAGE_VERSION=$IMAGE_VERSION \
  --build-arg NODE_VERSION=$NODE_VERSION \
  --build-arg NPM_VERSION=$NPM_VERSION \
  --build-arg PORT=$PORT
docker tag registry.heroku.com/$IMAGE_NAME:$IMAGE_VERSION registry.heroku.com/$IMAGE_NAME

