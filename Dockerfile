FROM node:20 as builder
WORKDIR /usr/src/app

RUN apt install curl bash
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
	&& . ~/.nvm/nvm.sh \
	&& nvm install 20 \
	&& nvm alias default 20 \
	&& nvm use 20
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
