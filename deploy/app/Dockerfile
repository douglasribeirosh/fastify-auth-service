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
RUN npm run build && npm prune --omit=dev --ignore-scripts

# Application image with dist
FROM node-npm AS app
ARG PORT
WORKDIR /usr/src/app
COPY --from=app-build /usr/src/app/node_modules ./node_modules
COPY --from=app-build /usr/src/app/dist ./dist
COPY package*.json ./
EXPOSE ${PORT}
CMD ["node", "-r", "source-map-support/register", "dist/back/main/index"]

