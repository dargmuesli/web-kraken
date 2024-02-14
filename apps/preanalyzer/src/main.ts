#! /usr/bin/env node

import { Command } from 'commander';
import figlet from 'figlet';
import { test } from './commands/test';

const program = new Command();

console.log(figlet.textSync("WASM-Analyzer"));

program
    .version("0.0.1")
    .description("WASM-Analyzer is a tool to analyze WebAssembly files");

program
    .command('test <echo>')
    .description('Test command')
    .action(test);

program.parse(process.argv);
