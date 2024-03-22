# Preanalyzer

The Preanalyzer is used to preprocess wasm files before the actual analysis. It is used to extract information about used functions, opcodes, sections and data segments.  
Additionally, the Preanalyzer tries to detect the language and features of the wasm file.

## Commands

The following commands are used to preanalyze wasm files. Most commands are based on the functionalities provided by the [WebAssembly Binary Toolkit (WABT)](https://github.com/webassembly/wabt).  
Each command can be used with `wasm-preanalyzer` as a prefix after installation.

### datadump

**Usage:** `datadump <file> [options]`  
The datadump command generates a list of all data segments of the data section defined in the given wasm file.  
Inside the generated Json format the raw data and the memory index (only for active data segments) of each data segment are included.
Can be used as input for the [analyze](#analyze) command.

| Option                | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `-o, --output [file]` | Output file for the generated data section list (Json format). If no name is given, a name based on the input file will be used. |

### wasm2wat

**Usage:** `wasm2wat <file> [options]`  
The wasm2wat command converts the given wasm file to a wat file.   
The command is based on the WABT `wasm2wat` command and acts as a wrapper with output functionality.

| Option                | Description                                                                                               |
|-----------------------|-----------------------------------------------------------------------------------------------------------|
| `-o, --output [file]` | Output file for the generated wat file. If no name is given, a name based on the input file will be used. |

### objdump

**Usage:** `objdump <file> [options]`
The objdump command outputs information about various sections of the file and a disassembly of the given wasm file.
The command is based on the WABT `wasm-objdump` command and acts as a wrapper with output functionality.

| Option                | Description                                                                                                   |
|-----------------------|---------------------------------------------------------------------------------------------------------------|
| `-o, --output [file]` | Output file for the generated objdump file. If no name is given, a name based on the input file will be used. |

### funcls

**Usage:** `funcls <file> [options]`  
The funcls command generates a list of all functions defined in the given wasm file.  
Inside the generated Json format the name, parameter and return types and whether the function is imported, exported or internal are included. (*optional)  
If the function list includes the imported functions, the names of the modules are included as well.  
The command is based on the WABT `wasm-objdump` command restricted to the `Function` or `Import` sections.

| Option                | Description                                                                                                                                                     |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-o, --output [file]` | Output file for the generated function list (Json format). If no name is given, a name based on the input file will be used.                                    |
| `-s, --sort [name]`   | Sorts the function list by the given name. Possible values are: `name`, `source`, `appearence`. Default is `appearence` (order of appearance in the wasm file). |

### sectionls

**Usage:** `sectionls <file> [options]`  
The sectionls command generates a list of all *custom* sections defined in the given wasm file.  
Inside the generated Json format the name and raw data of each custom section are included.  
If the file contains a [producers custom section](https://github.com/WebAssembly/tool-conventions/blob/main/ProducersSection.md) additional information such as source languages,
individual tools and SDKs are extracted and included in the Json format.

| Option                | Description                                                                                                                 |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `-o, --output [file]` | Output file for the generated section list (Json format). If no name is given, a name based on the input file will be used. |

### opcodels

**Usage:** `opcodels <file> [options]`  
The opcodels command generates a list of all opcodes used inside the given wasm file.  
Inside the generated Json format the name, count, percentage (count of the opcode divided by total number of opcodes) and feature of each opcode are included.
The command is based on the WABT `wasm-opcodecnt` command.

| Option                | Description                                                                                                                |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------|
| `-o, --output [file]` | Output file for the generated opcode list (Json format). If no name is given, a name based on the input file will be used. |
| `-s, --sort [name]`   | Sorts the opcode list by the given name. Possible values are: `name`, `feature`, `count`. Default is `count`.              |

### batch

**Usage:** `batch [options]`
The batch command is used to analyze multiple wasm files at once. By default, it analyzes all wasm files inside the current directory.  
Analyzed aspects are the used functions, opcodes, sections and data segments. Additionally, the [language](#language-detection) and [features](#feature-detection) of the wasm file are detected.  
Information about each file will be saved in the './data' directory.

| Option                    | Description                                                                                                |
|---------------------------|------------------------------------------------------------------------------------------------------------|
| `-j, --jsonInput <input>` | Specifies the input file for the batch analysis. The input file must an array of the files in Json format. |

### packageanalyze

**Usage:** `packageanalyze <token>`
The packageanalyze command is used to analyze all package files generated by the [crawler](#crawler) inside the './packages' directory.  
The command generates additional information about the used languages inside the packages.

## Feature Detection

The extended features as defined in the [WebAssembly Roadmap](https://webassembly.org/features/)
are detected by the Analyzer. The detection is based on different heuristics.
Currently, the following features are detected:

### Standardized features:

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

### In-progress proposals:

| Detected | Feature                                                                                                                                                      | Detection type                                                                    |
|:--------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------|
|    ✅     | [Exception Handling](https://github.com/WebAssembly/exception-handling/blob/master/proposals/exception-handling/Exceptions.md)                               | Opcodes &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp; |
|    ❌     | [JS Promise Integration](https://github.com/WebAssembly/js-promise-integration) &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; |                                                                                   |
|    ❌     | [Memory64](https://github.com/WebAssembly/memory64/blob/master/proposals/memory64/Overview.md)                                                               |                                                                                   |
|    ❌     | [Type reflection](https://github.com/WebAssembly/js-types/blob/main/proposals/js-types/Overview.md)                                                          |                                                                                   |

### Detection types:

| Detection type      | Description                                                                                                                                                                                                   |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| i64 Typing          | The feature is detected by checking the usage of i64 typing as parameter or return type of exported/imported functions or globals.                                                                            |
| Opcodes             | The feature is detected by checking for the presence of specific opcodes. The specific opcodes are defined in their respective proposals or partially via [this link](https://pengowray.github.io/wasm-ops/). |
| Reference to memory | The feature is detected by checking for the reference of memory with an index greater than zero inside the data section.                                                                                      |
| Return types        | The feature is detected by checking for the presence of multiple return types in functions.                                                                                                                   |
| Mutable             | The feature is detected by checking for the presence of mutable globals via the mutable flag of imported globals or the mutability of exported globals.                                                       |

## Language Detection

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

Current detection status for 1249 wasm files:

| Language       | Detected |
|----------------|----------|
| Rust           | 568      |
| unknown        | 492      |
| C++            | 66       |
| AssemblyScript | 55       |
| multiple       | 44       |
| Go             | 22       |
| C              | 2        |

(unknown = no information found, multiple = multiple languages found)  
(As of 2024-02-29)
