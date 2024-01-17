#! /usr/bin/env node

import {Command} from "commander";
import {funcls} from "./commands/funcls";
import {opcodels} from "./commands/opcodels";
import * as figlet from "figlet";
import {batch} from "./commands/batch";
import {sectionls} from "./commands/sectionls";
import {ast} from "./commands/ast";
import {analyze} from "./commands/analyze";
import { wasm2wat } from './commands/wasm2wat';
import { objdump } from './commands/objdump';
import { npmdata } from './commands/npmdata';

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
    .option('-c, --convert', 'Convert wasm to wat')
    .option('-d, --dump', 'Objdump wasm file')
    .option('-j, --jsonInput <input>', 'Specify the wasm files to analyze in json format')
    .description('Batch analyze wasm files in the directory')
    .action(batch);


program
    .command('sectionls <path>')
    .description('List all custom sections of the wasm file')
    .option('-o, --output [file]', 'Output to file')
    .action(sectionls);

program
    .command('ast <path>')
    .description('Ast test command')
    .action(ast);

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

program
    .command('npmdata <source>')
    .description('Get npm package data')
    .action(npmdata);

program.parse(process.argv);
