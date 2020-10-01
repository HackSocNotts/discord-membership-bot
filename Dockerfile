FROM node:12-alpine AS app-builder
WORKDIR /usr/app/src
COPY ./package.json .
COPY ./package-lock.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:12-alpine
WORKDIR /usr/app
COPY --from=app-builder /usr/app/src/package.json .
COPY --from=app-builder /usr/app/src/package-lock.json .
COPY --from=app-builder /usr/app/src/lib ./lib
RUN npm ci --production=true
ENV production true
CMD ["node", "./lib/index.js"]
