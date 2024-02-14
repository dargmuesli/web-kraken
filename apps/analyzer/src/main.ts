#! /usr/bin/env node

import { Command } from 'commander';
import * as figlet from 'figlet';
import { batch } from './commands/batch';
import { analyze } from './commands/analyze';
import { wasm2wat } from './commands/wasm2wat';
import { objdump } from './commands/objdump';


const program = new Command();

console.log(figlet.textSync('WASM-Analyzer'));

program
    .version('0.0.1')
    .description('WASM-Analyzer is a tool to analyze WebAssembly files');

program
    .command('batch')
    .option('-c, --convert', 'Convert wasm to wat')
    .option('-d, --dump', 'Objdump wasm file')
    .option('-j, --jsonInput <input>', 'Specify the wasm files to analyze in json format')
    .description('Batch analyze wasm files in the directory')
    .action(batch);

program
    .command('analyze [file]')
    .description('Analyze wasm files in the directory')
    .action(analyze);

program
    .command('wasm2wat <path>')
    .option('-o, --output [file]', 'Output to file')
    .description('Convert wasm file to wat file')
    .action(wasm2wat);

program
    .command('objdump <path>')
    .option('-o, --output [file]', 'Output to file')
    .description('Objdump wrapper command')
    .action(objdump);

program.parse(process.argv);
