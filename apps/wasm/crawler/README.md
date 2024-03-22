# Crawler

The crawler is used to download wasm files from different sources.  
Each command can be used with `wasm-crawler` as a prefix after installation.

## Crawling approaches

The crawler is able to download wasm files from the following sources:

### NPM crawling

Via the [npm public registry](https://docs.npmjs.com/cli/v10/using-npm/registry) and CouchDB replication the crawler is able to download all available npm packages as tarballs and search for wasm files inside them.  
Wasm files are detected by checking for files with the `.wasm` extension. Additionally, the crawler saves the source and metadata like keywords, description and readme of each package inside the './packages' directory.  
The crawler can be used if a locally replicated npm registry via CouchDB is available using the following command:  
`npm <db>` where db is the name of the database.

| Option                      | Description                                                                                                                                  |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `-b, --bookmark <bookmark>` | Bookmark to start crawling from. Can be used to continue a previous crawling. The last bookmark will be shown after cancelling the crawling. |
| `-p, --path <file>`         | Path to saved the crawled files to.                                                                                                          |

A better way to use the npm crawler is via Docker. See [NPM-Crawling via Docker](#npm-crawling-via-docker) for more details.

### GitHub crawling

GitHub crawling is based on the [GitHub API](https://docs.github.com/en/rest) and the [GitHub Search API](https://docs.github.com/en/rest/reference/search).
There are two different ways to crawl for wasm files on GitHub:

1. By searching exclusively for WebAssembly files via the `language:WebAssembly` search query, the crawler is able to find and download all available files with the `.wat` extension.
   These files can then be converted to wasm files via the [WABT](https://github.com/webassembly/wabt) tool `wat2wasm`.  
   Wasm files extracted this way are not optimal for further analysis as they are not compiled from source code.
2. Each wasm file must contain a magic number at the beginning of the file. This magic number is `0061736d` in hex format or `asm` in ASCII format.  
   Some JavaScript files directly contain wasm files as strings inside the source code in a base64 encoded format. The magic number in the base64 format equals `AGFzbQ`.  
   By searching for this string inside JavaScript files via the `AGFzbQ language:JavaScript` search query, the crawler is able to find all embedded wasm files which can then be extracted and converted back to the regular hex format.  
   As the files represent actually compiled wasm files, they are optimal for further analysis and generally more interesting than the files found via the first approach.
   Because these files are embedded inside JavaScript files as strings, the sizes of the files are on average smaller than the ones found via the NPM crawling approach.

The GitHub crawler can be used with the following command:  
`gitcrawler <token>` where token is a GitHub access token which is required to use the GitHub API and can be created [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

| Option                  | Description                                                                                |
|-------------------------|--------------------------------------------------------------------------------------------|
| `-n, --number <number>` | Number of wasm files to download. (Default 1000 or less if not enough files are available) |
| `-a, --all`             | Crawl for all possible files.                                                              |
| `-m, --magic`           | Use the magic number approach to find wasm files. (Default is the wat approach)            |

## NPM-Crawling via Docker

1. Clone this repository.
2. Install Docker and Docker-Compose https://docs.docker.com/get-docker/.
3. Run `nx run crawler:build:production` to build the crawler.
4. Run `docker-compose up --no-build` to start the couchdb.
5. Open CouchDB dashboard http://127.0.0.1:5984/_utils.
6. Create a new database.
7. Set the permissions of the database to public (remove the admin and member roles).
8. Create a new replication with the remote source https://skimdb.npmjs.com/registry and the previously created
   database as target. Authentication for the local database may be required.
9. Add the following to the replication document: `"use_checkpoints": false`.
10. The npm database should now be starting to replicate. This may take a while. To stop the replication remove the
    replication document.
11. Run `docker-compose build wasm-crawler` to build the image of the crawler. To start the crawler run
    `docker-compose up wasm-crawler`. The crawler will now start to crawl the database. The crawled files will be
    stored in the directory defined in the volumes section of the wasm-crawler service in the docker-compose.yml.
