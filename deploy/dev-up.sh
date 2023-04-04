#!/bin/bash
#Execute from folder this folder
##bash dev-up.sh

NAME="dsh.fastify-auth-api"
[ -z "$1" ] && VERSION=latest || VERSION=$1
IMAGE_NAME="dsh.fastify-auth-api/web"
[ -z "$PORT" ] && PORT=33668
[ -z "$LOG_LEVEL" ] && LOG_LEVEL=trace

docker network create $NAME

docker run -d \
  --name $NAME.redis \
  --network $NAME \
  redis:latest

docker run \
  --network $NAME \
  --name $NAME.app -p $PORT:$PORT \
  -e PORT=$PORT \
  -e REDIS_URL=redis://$NAME.redis:6379/0 \
  -e LOG_LEVEL=$LOG_LEVEL \
  -e DATABASE_URL="file:./dev.db" \
  -d \
  $IMAGE_NAME:$VERSION
docker logs -f $NAME.app
