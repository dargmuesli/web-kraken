#! /usr/bin/env node

import {Command} from "commander";
import {npm} from "./commands/npm";

const program = new Command();

program
    .command('npm <db>')
    .description('Crawl npm packages for wasm files')
    .action(npm);

program.parse(process.argv);