#! /usr/bin/env node

import { Command } from 'commander';
import figlet from 'figlet';
import { datadump } from './commands/datadump';
import { sectionls } from './commands/sectionls';
import { opcodels } from './commands/opcodels';
import { funcls } from './commands/funcls';

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
    .command('funcls <file>')
    .description('List all functions of the wasm file')
    .option('-o, --output [file]', 'Output to file', )
    .option('-s, --sort [name]', 'Sort by name|source|appearance(default)')
    .action(funcls);

program
    .command('sectionls <file>')
    .description('List all custom sections of the wasm file')
    .option('-o, --output [file]', 'Output to file')
    .action(sectionls);

program
    .command('opcodels <file>')
    .description('Opcodes in the wasm file')
    .option('-o, --output [file]', 'Output to file')
    .option('-s, --sort [sort]', 'Sort by name|feature|count(default)')
    .action(opcodels);

program.parse(process.argv);
