#! /usr/bin/env node

import { Command } from 'commander';
import figlet from 'figlet';
import { batch } from './commands/batch';
import { analyze } from './commands/analyze';
import { wasm2wat } from './commands/wasm2wat';
import { objdump } from './commands/objdump';
import { groupAnalyze } from './commands/group-analyze';
import { keywordfiles } from './commands/keywordfiles';


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
    .command('analyze')
    .description('Analyze wasm files in the directory')
    .action(analyze);

program
    .command('group-analyze')
    .description('Analyze wasm files in the directory and group the results')
    .option('-j, --jsonInput <input>', 'Specify the wasm files to analyze in json format')
    .action(groupAnalyze);

program
    .command('wasm2wat <file>')
    .option('-o, --output [file]', 'Output to file')
    .description('Convert wasm file to wat file')
    .action(wasm2wat);

program
    .command('objdump <file>')
    .option('-o, --output [file]', 'Output to file')
    .description('Objdump wrapper command')
    .action(objdump);

program
    .command('keywordfiles <output>')
    .option('-i, --invert', 'Invert the search')
    .description('Saves the files that contain the keywords in a json file')
    .argument('<keywords...>')
    .action(keywordfiles);

program.parse(process.argv);
