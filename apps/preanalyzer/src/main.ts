#! /usr/bin/env node

import { Command } from 'commander';
import figlet from 'figlet';
import { datadump } from './commands/datadump';

const program = new Command();

console.log(figlet.textSync("WASM-Analyzer"));

program
    .version("0.0.1")
    .description("WASM-Analyzer is a tool to analyze WebAssembly files");

program
    .command('datadump <file>')
    .option('-o, --output [file]', 'Output to file')
    .description('Dumps the data section of a wasm file')
    .action(datadump);

program.parse(process.argv);
