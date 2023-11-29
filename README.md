# WASM-Analyzer
## Crawler
### Setting up CouchDB
1. Install CouchDB https://docs.couchdb.org/en/stable/install/index.html.
2. Open CouchDB dashboard http://127.0.0.1:5984/_utils.
3. Create a new database.
4. Set the permissions of the database to public (remove the admin and member roles).
5. Create a new replication with the remote source https://skimdb.npmjs.com/registry and the previously created 
database as target. Authentication for the local database may be required.
6. The npm database should now be starting to replicate. This may take a while. To stop the replication remove the
replication document.
### Running the npm crawler
1. Set up CouchDB as described above.
2. Clone the repository.
3. Open the WASM-Crawler directory.
4. Run `npm install -g`.
5. Open the directory the resulting wasm-files should be stored in.
6. Run `wasm-crawler npm [url of the database]` (e.g. `wasm-crawler npm http://127.0.0.1:5984/npm`).
7. The crawler should now start to crawl the npm database for wasm-files. This may take a while.
8. To stop the crawler press `Ctrl+C`. The resulting bookmark can be used to continue the crawling process at a later time
with the command `wasm-crawler npm [url of the database] [bookmark]`.

