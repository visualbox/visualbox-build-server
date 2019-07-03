FROM node:12-alpine as base

FROM base as build
WORKDIR /build
COPY . .
RUN yarn && yarn build

FROM base
RUN apk add --no-cache docker
WORKDIR /app
COPY --from=build /build/dist dist/
COPY --from=build /build/node_modules node_modules
ENTRYPOINT node dist/server.js
