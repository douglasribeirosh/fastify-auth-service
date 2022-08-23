#!/bin/bash
#Execute from folder this folder
##bash build.sh

NAME="dsh-fastify-auth-api"
VERSION=$1
IMAGE_NAME="dsh-fastify-auth-api/web"

docker run --name $NAME -d registry.heroku.com/$IMAGE_NAME:$1 

docker logs -f $NAME
