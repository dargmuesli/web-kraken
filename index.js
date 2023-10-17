#! /usr/bin/env node
const { program } = require('commander');
const funcls = require('./commands/funcls');

program
    .command('funcls <path>')
    .description('List all functions of the wasm file')
    .action(funcls);

program.parse();