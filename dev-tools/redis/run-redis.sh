#!/bin/bash
docker run -d --name redis-stack -p 6379:6379 redis/redis-stack:latest
