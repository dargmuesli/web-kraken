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
There are multiple ways to detect the language of a wasm file (sorted by reliability):
- The [producers custom section](https://github.com/WebAssembly/tool-conventions/blob/main/ProducersSection.md) can contain a field with the source language of the wasm file (generally save to assume).
- The [go.buildid and go.version custom sections](https://wazero.io/languages/go/)  indicate that the wasm file was compiled from Go source code (generally save to assume).
- By searching for specific keywords inside the source of each imported function the language of the file might be identified.  
This approach is not save to assume for some keywords as the keywords might be used in multiple languages.  
The following keywords are currently supported:
    - `rust` for Rust
    - `go.runtime`, `go.syscall`, `go.interface`, `go.mem` for Go
- By searching for file paths inside the data section of the wasm file, the language of the file might be identified via the file extension.   
  This approach is not save to assume as the file paths might be wrong or the file might be compiled from multiple source files.   
  The following file paths are currently supported:
    - `*.rs` for Rust
    - `*.cpp` for C++
    - `*.go` for Go
    - `*.ts` for AssemblyScript (in a different format)

Current detection status for 1217 wasm files:

| Language       | Detected |
|----------------|----------|
| Rust           | 560      |
| Unknown        | 471      |
| C++            | 66       |
| AssemblyScript | 55       |
| Uncertain      | 41       |
| Go             | 22       |
| C              | 2        |
(Unknown = no information found, Uncertain = multiple languages found)  
(As of 2024-01-25)
## Crawler
### Crawling approaches
#### NPM crawling
Via the [npm public registry](https://docs.npmjs.com/cli/v10/using-npm/registry) and CouchDB replication the crawler is able to download all available npm packages as tarballs and search for wasm files inside them.  
Wasm files are detected by checking for files with the `.wasm` extension. Additionally, the crawler saves the source and metadata like keywords, description and readme of each package inside  the './packages' directory.  
The crawler can be used if a locally replicated npm registry via CouchDB is available using the following command:  
`npm [db]` where db is the name of the database.

| Option                      | Description                                                                                                                                  |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `-b, --bookmark [bookmark]` | Bookmark to start crawling from. Can be used to continue a previous crawling. The last bookmark will be shown after cancelling the crawling. |
| `-d, --path [path]`         | Path to saved the crawled files to.                                                                                                          |

A better way to use the npm crawler is via Docker. See [NPM-Crawling via Docker](#npm-crawling-via-docker) for more details.

#### GitHub crawling
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
`gitcrawler [toke]` where token is a GitHub access token which is required to use the GitHub API and can be created [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

| Option                  | Description                                                                                |
|-------------------------|--------------------------------------------------------------------------------------------|
| `-n, --number [number]` | Number of wasm files to download. (Default 1000 or less if not enough files are available) |
| `-a, --all`             | Crawl for all possible files.                                                              |
| `-m, --magic [path]`    | Use the magic number approach to find wasm files. (Default is the wat approach)            |

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
