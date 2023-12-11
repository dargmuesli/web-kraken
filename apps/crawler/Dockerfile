FROM node:latest

# Install the wasm-crawler globally
RUN npm install -g wasm-crawler

# Define the command to start the wasm-crawler
CMD ["wasm-crawler", "npm", "http://couchdb:5984/npm"]