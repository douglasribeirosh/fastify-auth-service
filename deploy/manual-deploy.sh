#!/bin/bash
#Execute from folder this folder
##bash manual-deploy.sh

## To login to Heroku Container Registry:
## heroku container:login

NAME="dsh-fastify-auth-api"
[ -z "$1" ] && VERSION=latest || VERSION=$1
IMAGE_NAME="dsh-fastify-auth-api/web"

docker push registry.heroku.com/$IMAGE_NAME
heroku container:release web
