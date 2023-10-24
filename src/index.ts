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
    .action(funcls);

program
    .command('opcodels <path>')
    .description('Opcodes in the wasm file')
    .option('-c, --count', 'Show count of each opcode')
    .action(opcodels);

program.parse(process.argv);


