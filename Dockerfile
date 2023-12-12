FROM node:latest
WORKDIR /app
COPY ./dist/apps/crawler .
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN npm install
CMD node apps/crawler/src/main.js npm $DATABASE_URL -p /app/crawler_data
