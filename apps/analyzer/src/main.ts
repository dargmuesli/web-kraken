#! /usr/bin/env node

import { Command } from 'commander';
import figlet from 'figlet';
import { analyze } from './commands/analyze';
import { keywordfiles } from './commands/keywordfiles';
import { compare } from './commands/compare';


const program = new Command();

console.log(figlet.textSync('WASM-Analyzer'));

program
    .version('0.0.1')
    .description('WASM-Analyzer is a tool to analyze WebAssembly files');

program
    .command('analyze')
    .description('Analyze wasm files in the directory and group the results')
    .option('-j, --jsonInput <input>', 'Specify the wasm files to analyze in json format')
    .option('-o, --output [file]', 'Output info to file json file')
    .action(analyze);


program
    .command('keywordfiles <output>')
    .option('-i, --invert', 'Invert the search')
    .description('Saves the files that contain the keywords in a json file')
    .argument('<keywords...>')
    .action(keywordfiles);

program
    .command('compare <file1> <file2>')
    .description('Compare the data of two analysis files')
    .option('-t, --thresholds <thresholds...>', 'Thresholds for each opcode comparison')
    .action(compare);

program.parse(process.argv);
