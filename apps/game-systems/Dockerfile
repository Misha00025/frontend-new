FROM node:20 as builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:lts-alpine

WORKDIR /app
COPY --from=builder /usr/src/app/build ./build
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && npm install -g serve

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["serve", "-s", "build", "-l", "3000"]
