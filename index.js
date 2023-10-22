#! /usr/bin/env node
const { program } = require('commander');
const funcls = require('./commands/funcls');
const opcode = require('./commands/opcode');

program
    .command('funcls <path>')
    .description('List all functions of the wasm file')
    .option('-t, --type', 'Show function types')
    .action(funcls);

program
    .command('opcode <path>')
    .description( 'Opcodes in the wasm file')
    .option('-c, --count', 'Show count of each opcode')
    .action(opcode);

program.parse();