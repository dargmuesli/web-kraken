#! /usr/bin/env node

import {Command} from "commander";
import {funcls} from "./commands/funcls";
import {opcodels} from "./commands/opcodels";
import * as figlet from "figlet";
import {batch} from "./commands/batch";
import {gitcrawler} from "./commands/gitcrawler";
import {sectionls} from "./commands/sectionls";

const program = new Command();

console.log(figlet.textSync("WASM-Analyzer"));

program
    .version("0.0.1")
    .description("WASM-Analyzer is a tool to analyze WebAssembly files");


program
    .command('funcls <path>')
    .description('List all functions of the wasm file')
    .option('-t, --type', 'Show function types')
    .option('-o, --output [file]', 'Output to file', )
    .option('-i, --import' , 'Show imported functions')
    .option('-s, --sort [name]', 'Sort by name|source|appearance(default)')
    .action(funcls);

program
    .command('opcodels <path>')
    .description('Opcodes in the wasm file')
    .option('-c, --count', 'Show count of each opcode')
    .option('-f, --feature', 'Show feature of each opcode')
    .option('-o, --output [file]', 'Output to file')
    .option('-s, --sort [sort]', 'Sort by name|feature|count(default)')
    .action(opcodels);

program
    .command('batch')
    .option('-i, --import', 'Show imported functions')
    .option('-f, --function', 'Show functions')
    .option('-o, --opcode', 'Show opcodes')
    .option('-s, --section', 'Show sections')
    .description('Batch analyze wasm files in the directory')
    .action(batch);

program
    .command('gitcrawler <token>')
    .option('-p, --page <page>', 'Page number of the search result')
    .option('-n, --number <number>', 'Number of results to crawl')
    .description('Crawl github repositories for wasm/wat files')
    .action(gitcrawler);

program
    .command('sectionls <path>')
    .description('List all custom sections of the wasm file')
    .option('-o, --output [file]', 'Output to file')
    .action(sectionls);

program.parse(process.argv);


