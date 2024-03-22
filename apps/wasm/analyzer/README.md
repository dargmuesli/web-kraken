# Analyzer

The analyzer is used to analyze multiple wasm files averagely and generate statistics about the used functions, opcodes, sections and data segments.

## Commands

Each command can be used with `wasm-analyzer` as a prefix after installation.

### keywordfiles

**Usage:** `keywordfiles <output> <keywords...> [options]`  
The keywordfiles command generates a list of all files based on the keywords found inside the npm packages.  
At this point, possible keywords are: `webassembly`, `crypto`, `graphics`, `ml`, `audio` and `data`.

| Option         | Description                                                                                |
|----------------|--------------------------------------------------------------------------------------------|
| `-i, --invert` | Inverts the search for the given keywords. (all files that don't match the given keywords) |

### analyze

**Usage:** `analyze [options]`  
The analyze command is used to analyze multiple wasm files at once. By default, it analyzes all data files inside the './data' directory generated by the [preanalyzer](#preanalyzer).  
Analyzed aspects are the used functions, opcodes, sections and data segments. Additionally, statistics about the used languages and features are generated.

| Option                    | Description                                                                                                                                                               |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-j, --jsonInput <input>` | Specifies the input file for the batch analysis. The input file must an array of the files in Json format. Can be generated by the [keywordfiles](#keywordfiles) command. |
| `-o, --output [file]`     | Output file for the generated analysis (Json format).                                                                                                                     |

### compare

**Usage:** `compare <file1> <file2> [options]`  
The compare command is used to compare two analysis files generated by the [analyze](#analyze) command.

| Option                               | Description                                                                                                                                                                                                                                               |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-t, --thresholds <threshholds...> ` | Specifies the thresholds for the comparison of opcodes. The thresholds are based on the percentage of the opcodes in the files.  <br/> Up to three thresholds can be specified: full opcodes, only types, only operations  <br/>example: `-t 0.1 0.1 0.1` |

### language

**Usage:** `language <file>`
The language command is used to print statistics about the used languages inside the wasm file and the corresponding package.