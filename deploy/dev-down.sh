#!/bin/bash
#Execute from folder this folder
##bash dev-down.sh

NAME="dsh.fastify-auth-api"
[ -z "$1" ] && VERSION=latest || VERSION=$1

docker stop $NAME.app
docker rm $NAME.app
docker stop $NAME.redis
docker rm $NAME.redis
docker network rm $NAME
