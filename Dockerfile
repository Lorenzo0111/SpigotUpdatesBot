FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile --production
COPY . .

EXPOSE 8080
CMD [ "yarn", "start" ]