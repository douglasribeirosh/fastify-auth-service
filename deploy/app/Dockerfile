ARG NODE_VERSION

# Base system image with specific version of node and npm
FROM node:${NODE_VERSION}-alpine AS node-npm
ARG NPM_VERSION
RUN apk --no-cache add curl
RUN npm config set production=true update-notifier=false loglevel=error audit=false fund=false
RUN npm i -g npm@${NPM_VERSION}

# Base application image with dependencies installed
FROM node-npm AS app-base
WORKDIR /usr/src/app
COPY package*.json .npmrc ./
RUN npm ci --prefer-offline --dev --ignore-scripts

# Build application dist
FROM app-base AS app-build
WORKDIR /usr/src/app
COPY --from=app-base /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src
COPY prisma/ ./prisma
ARG DATABASE_URL
RUN npx prisma generate
RUN npx prisma migrate dev
RUN npm run build && npm prune --ignore-scripts

# Application image with dist
FROM node-npm AS app
ARG PORT
ARG IMAGE_VERSION
WORKDIR /usr/src/app
COPY --from=app-build /usr/src/app/node_modules ./node_modules
COPY --from=app-build /usr/src/app/dist ./dist
RUN mkdir ./prisma
COPY --from=app-build /usr/src/app/prisma/dev.db ./prisma/
COPY package*.json ./
ENV IMAGE_VERSION ${IMAGE_VERSION}
EXPOSE ${PORT}
CMD ["node", "dist/src/back/main/index"]
#CMD ["sleep", "infinity"]