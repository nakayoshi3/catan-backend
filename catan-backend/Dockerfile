FROM node:alpine3.19

WORKDIR /app

COPY package*.json .
# Install npm package
RUN npm install npm
RUN npm install cors@2.8.5
RUN npm install socket.io@4.8.0
RUN npm install socket.io-client@4.8.0

COPY . .

RUN apk update && apk add --no-cache git
RUN apk add sudo