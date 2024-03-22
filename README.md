# Web Kraken

## WASM-Analyzer

WASM-Analyzer is a tool to analyze WebAssembly (wasm) files.
It consists of a crawler to download wasm files from different sources, a preanalyzer to preprocess wasm files before the actual analysis and an analyzer to analyze multiple wasm files averagely.
To install the CLIs globally run `npm install -g` inside the repository.

The following tools are available:

- [`crawler`](./apps/crawler): Crawl wasm files from different sources.
- [`preanalyzer`](./apps/preanalyzer): Preprocess wasm files before the actual analysis.
- [`analyzer`](./apps/analyzer): Analyze multiple wasm files averagely.
