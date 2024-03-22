FROM node:latest
RUN npm install -g pnpm
WORKDIR /app
COPY ./dist/apps/wasm/crawler .
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm install
CMD node apps/wasm/crawler/src/main.js npm $DATABASE_URL -p /app/crawler_data
