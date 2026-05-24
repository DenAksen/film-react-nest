FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ARG VITE_API_URL
ARG VITE_CDN_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CDN_URL=$VITE_CDN_URL

RUN npm run build

CMD ["sh", "-c", "cp -r /app/dist/* /dist/ && tail -f /dev/null"]