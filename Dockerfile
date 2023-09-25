FROM node:20-alpine
WORKDIR /app

LABEL org.opencontainers.image.source https://github.com/Lorenzo0111/SpigotUpdatesBot

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile --production
COPY . .

EXPOSE 8080
CMD [ "yarn", "start" ]