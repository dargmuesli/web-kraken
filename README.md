# WASM-Analyzer

## Analyzer
### Commands
The following commands are used to analyze wasm files. Most commands are based on the functionalities provided by the [WebAssembly Binary Toolkit (WABT)](https://github.com/webassembly/wabt).

#### funcls
**Usage:** `funcls [file] [options]`  
The funcls command generates a list of all functions defined in the given wasm file. Based on the given options, the list instead only includes imported functions.  
Inside the generated Json format the name, *parameter and *return types and whether the function gets exported or not are included. (*optional)  
If the function list includes the imported functions, the names of the modules are included as well.  
The command is based on the WABT `wasm-objdump` command restricted to the `Function` or `Import` sections.  
Can be used as input for the [analyze](#analyze) command.

| Option                | Description                                                                                                                                                     |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-o, --output [file]` | Output file for the generated function list (Json format). If no name is given, a name based on the input file will be used.                                    |
| `-t, --type`          | Include parameter and return types in the function list.                                                                                                        |
| `-i, --import`        | Function list only includes imported functions.                                                                                                                 |
| `-s, --sort [name]`   | Sorts the function list by the given name. Possible values are: `name`, `source`, `appearence`. Default is `appearence` (order of appearance in the wasm file). |


#### opcodels
**Usage:** `opcodels [file] [options]`  
The opcodels command generates a list of all opcodes used inside the given wasm file.  
Inside the generated Json format the name, *count, percentage (count of the opcode divided by total number of opcodes) and *feature of each opcode are included. (*optional)  
The command is based on the WABT `wasm-opcodecnt` command.  
Can be used as input for the [analyze](#analyze) command.

| Option                | Description                                                                                                                     |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `-o, --output [file]` | Output file for the generated opcode list (Json format). If no name is given, a name based on the input file will be used.      |
| `-c, --count`         | Include the count of each opcode in the opcode list.                                                                            |
| `-f, --feature`       | Include the feature of each opcode in the opcode list. More details inside the [Feature Detection](#feature-detection) section. |
| `-s, --sort [name]`   | Sorts the opcode list by the given name. Possible values are: `name`, `feature`, `count`. Default is `count`.                   |

#### sectionls
**Usage:** `sectionls [file] [options]`  
The sectionls command generates a list of all *custom* sections defined in the given wasm file.  
Inside the generated Json format the name and raw data of each custom section are included.  
If the file contains a [producers custom section](https://github.com/WebAssembly/tool-conventions/blob/main/ProducersSection.md) additional information such as source languages, 
individual tools and SDKs are extracted and included in the Json format.  
Can be used as input for the [analyze](#analyze) command.

| Option                | Description                                                                                                                 |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `-o, --output [file]` | Output file for the generated section list (Json format). If no name is given, a name based on the input file will be used. |

#### datadump
**Usage:** `datadump [file] [options]`  
The datadump command generates a list of all data segments of the data section defined in the given wasm file.  
Inside the generated Json format the raw data and the memory index (only for active data segments) of each data segment are included.
Can be used as input for the [analyze](#analyze) command.

| Option                | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `-o, --output [file]` | Output file for the generated data section list (Json format). If no name is given, a name based on the input file will be used. |

#### wasm2wat
**Usage:** `wasm2wat [file] [options]`  
The wasm2wat command converts the given wasm file to a wat file.   
The command is based on the WABT `wasm2wat` command and acts as a wrapper with output functionality.

| Option                | Description                                                                                               |
|-----------------------|-----------------------------------------------------------------------------------------------------------|
| `-o, --output [file]` | Output file for the generated wat file. If no name is given, a name based on the input file will be used. |

#### objdump
**Usage:** `objdump [file] [options]`
The objdump command outputs information about various sections of the file and a disassembly of the given wasm file.
The command is based on the WABT `wasm-objdump` command and acts as a wrapper with output functionality.

| Option                | Description                                                                                                   |
|-----------------------|---------------------------------------------------------------------------------------------------------------|
| `-o, --output [file]` | Output file for the generated objdump file. If no name is given, a name based on the input file will be used. |


#### batch
**Usage:** `batch [options]`  
The batch command allows to batch analyze multiple wasm files at once.
Depending on the given options, the analyzer will execute the corresponding commands for each file including all possible options of the respective command.

| Option                   | Description                                                                                                                                                           |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-i, --import`           | Batch analyze imported functions as seen in the [funcls](#funcls) command including the `-i` option. Resulting output files will be placed in the `import` directory. |
| `-f, --function`         | Batch analyze functions as seen in the [funcls](#funcls) command. Resulting output files will be placed in the `function` directory.                                  |
| `-o, --opcode`           | Batch analyze opcodes as seen in the [opcodels](#opcodels) command. Resulting output files will be placed in the `opcode` directory.                                  |
| `-s, --section`          | Batch analyze sections as seen in the [sectionls](#sectionls) command. Resulting output files will be placed in the `section` directory.                              |
| `-dd, --datadump`        | Batch analyze data sections as seen in the [datadump](#datadump) command. Resulting output files will be placed in the `datadump` directory.                          |
| `-c, --convert`          | Batch convert wasm files to wat files as seen in the [wasm2wat](#wasm2wat) command. Resulting output files will be placed in the `wat` directory.                     |
| `-d, --dump`             | Batch dump wasm files as seen in the [objdump](#objdump) command. Resulting output files will be placed in the `objdump` directory.                                   |
| `-j, --jsonInput [file]` | Json file containing the list of files to analyze. Without this option, the analyzer will analyze all wasm files in the current directory.                            |

#### analyze
**Usage:** `analyze [file]`  
The analyze command analyzes all wasm files in the current directory or the given file.  
The general idea is to use the already generated output files of the [batch](#batch) command as input for the analyze command.
For the best results, the following files and directories are required:
- `import` directory containing the output files of the [funcls](#funcls) command with the `-i` option.
- `function` directory containing the output files of the [funcls](#funcls) command.
- `opcode` directory containing the output files of the [opcodels](#opcodels) command.
- `section` directory containing the output files of the [sectionls](#sectionls) command.
- `datadump` directory containing the output files of the [datadump](#datadump) command.

To get these files and directories with the correct names, the [batch](#batch) command with according options can be used:  
`batch -i -f -o -s -dd`  
The command generates a `details.json` file containing the data of all files and some additional information such as detected [features](#feature-detection) and [languages](#language-detection).
---

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

### Language Detection


## Crawler
### Crawling types
#### NPM crawling
#### GitHub magic number crawling
#### GitHub WAT crawling

### Commands

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
