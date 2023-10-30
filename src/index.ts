#! /usr/bin/env node

import {Command} from "commander";
import {funcls} from "./commands/funcls";
import {opcodels} from "./commands/opcodels";
import * as figlet from "figlet";

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

program.parse(process.argv);


