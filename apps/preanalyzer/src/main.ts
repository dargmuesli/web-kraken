#! /usr/bin/env node

import { Command } from 'commander';
import figlet from 'figlet';
import { datadump } from './commands/datadump';
import { sectionls } from './commands/sectionls';

const program = new Command();

console.log(figlet.textSync("WASM-Analyzer"));

program
    .version("0.0.1")
    .description("WASM-Analyzer is a tool to analyze WebAssembly files");

program
    .command('datadump <file>')
    .description('Dumps the data section of a wasm file')
    .option('-o, --output [file]', 'Output to file')
    .action(datadump);

program
    .command('sectionls <file>')
    .description('List all custom sections of the wasm file')
    .option('-o, --output [file]', 'Output to file')
    .action(sectionls);

program.parse(process.argv);
