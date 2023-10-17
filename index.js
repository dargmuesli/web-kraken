#! /usr/bin/env node
const { program } = require('commander');
const funcls = require('./commands/funcls');
const opcodecnt = require('./commands/opcodecnt');

program
    .command('funcls <path>')
    .description('List all functions of the wasm file')
    .action(funcls);

program
    .command('opcodecnt <path>')
    .description('Count of each opcode in the wasm file')
    .action(opcodecnt);

program.parse();