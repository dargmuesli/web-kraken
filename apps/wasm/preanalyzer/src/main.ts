#! /usr/bin/env node

import { Command } from 'commander';
import figlet from 'figlet';
import { datadump } from './commands/datadump';
import { sectionls } from './commands/sectionls';
import { opcodels } from './commands/opcodels';
import { funcls } from './commands/funcls';
import { batch } from './commands/batch';
import { packageanalyze } from './commands/packageanalyze';
import { objdump } from './commands/objdump';
import { wasm2wat } from './commands/wasm2wat';

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

program
    .command('batch')
    .option('-j, --jsonInput <input>', 'Specify the wasm files to analyze in json format')
    .description('Batch analyze wasm files in the directory')
    .action(batch);

program
    .command('packageanalyze <token>')
    .description('Crawl npm packages for wasm files')
    .action(packageanalyze);

program
    .command('objdump <file>')
    .option('-o, --output [file]', 'Output to file')
    .description('Objdump wrapper command')
    .action(objdump);

program
    .command('wasm2wat <file>')
    .option('-o, --output [file]', 'Output to file')
    .description('Convert wasm file to wat file')
    .action(wasm2wat);

program.parse(process.argv);
