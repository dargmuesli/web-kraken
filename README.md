# WASM-Analyzer

## Analyzer
### Commands
| Command           | Options               | Description                                               |
|-------------------|-----------------------|-----------------------------------------------------------|
| `datadump [file]` | `-o, --output [file]` | Dump all data of the data section of the given wasm file. |

### Feature Detection
The extended features as defined in the [WebAssembly Roadmap](https://webassembly.org/features/) 
are detected by the Analyzer. The detection is based on different heuristics. 
Currently, the following features are detected:
#### Standardized features:
| Detected | Feature                                                                                                                                            | Detection type      |
|:--------:|----------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
|    ✅     | [JS BigInt to Wasm i64 integration](https://github.com/WebAssembly/JS-BigInt-integration)                                                          | i64 Typing          |
|    ✅     | [Bulk Memory Operations](https://github.com/WebAssembly/bulk-memory-operations/blob/master/proposals/bulk-memory-operations/Overview.md)           | Opcodes             |
|    ❌     | [Extended constant expressions](https://github.com/WebAssembly/extended-const/blob/master/proposals/extended-const/Overview.md)                    |                     |
|    ✅     | [Garbage collection](https://github.com/WebAssembly/gc)                                                                                            | Opcodes             |
|    ✅     | [Multiple memories](https://github.com/WebAssembly/multi-memory/blob/master/proposals/multi-memory/Overview.md)                                    | Reference to memory |
|    ✅     | [Multi-value](https://github.com/WebAssembly/spec/blob/master/proposals/multi-value/Overview.md)                                                   | Return types        |
|    ✅     | [Mutable globals](https://github.com/WebAssembly/mutable-global/blob/master/proposals/mutable-global/Overview.md)                                  | Mutable             |
|    ✅     | [Reference types](https://github.com/WebAssembly/reference-types/blob/master/proposals/reference-types/Overview.md)                                | Opcodes             |
|    ✅     | [Relaxed SIMD](https://github.com/WebAssembly/relaxed-simd/tree/main/proposals/relaxed-simd)                                                       | Opcodes             |
|    ✅     | [Non-trapping float-to-int conversions](https://github.com/WebAssembly/spec/blob/master/proposals/nontrapping-float-to-int-conversion/Overview.md) | Opcodes             |
|    ✅     | [Sign-extension operations](https://github.com/WebAssembly/spec/blob/master/proposals/nontrapping-float-to-int-conversion/Overview.md)             | Opcodes             |
|    ✅     | [Fixed-width SIMD](https://github.com/WebAssembly/simd/blob/master/proposals/simd/SIMD.md)                                                         | Opcodes             |
|    ✅     | [Tail calls](https://github.com/WebAssembly/tail-call/blob/master/proposals/tail-call/Overview.md)                                                 | Opcodes             |
|    ✅     | [Threads and atomics](https://github.com/WebAssembly/threads/blob/master/proposals/threads/Overview.md)                                            | Opcodes             |
#### In-progress proposals:
| Detected | Feature                                                                                                                                                      | Detection type                                                                    |
|:--------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------|
|    ✅     | [Exception Handling](https://github.com/WebAssembly/exception-handling/blob/master/proposals/exception-handling/Exceptions.md)                               | Opcodes &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp; |
|    ❌     | [JS Promise Integration](https://github.com/WebAssembly/js-promise-integration) &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; |                                                                                   |
|    ❌     | [Memory64](https://github.com/WebAssembly/memory64/blob/master/proposals/memory64/Overview.md)                                                               |                                                                                   |
|    ❌     | [Type reflection](https://github.com/WebAssembly/js-types/blob/main/proposals/js-types/Overview.md)                                                          |                                                                                   |
#### Detection types:
| Detection type      | Description                                                                                                                                                                                                   |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| i64 Typing          | The feature is detected by checking the usage of i64 typing as parameter or return type of exported/imported functions or globals.                                                                            |
| Opcodes             | The feature is detected by checking for the presence of specific opcodes. The specific opcodes are defined in their respective proposals or partially via [this link](https://pengowray.github.io/wasm-ops/). |
| Reference to memory | The feature is detected by checking for the reference of memory with an index greater than zero inside the data section.                                                                                      |
| Return types        | The feature is detected by checking for the presence of multiple return types in functions.                                                                                                                   |
| Mutable             | The feature is detected by checking for the presence of mutable globals via the mutable flag of imported globals or the mutability of exported globals.                                                       |




## Crawler

### NPM-Crawling via Docker

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
