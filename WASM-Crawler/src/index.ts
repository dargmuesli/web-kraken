#! /usr/bin/env node

import {Command} from "commander";
import {npm} from "./commands/npm";
import {gitcrawler} from "./commands/gitcrawler";

const program = new Command();

program
    .command('npm <db>')
    .description('Crawl npm packages for wasm files')
    .action(npm);

program
    .command('gitcrawler <token>')
    .option('-n, --number <number>', 'Number of results to crawl')
    .option('-m, --magic', 'Use magic number to detect wasm files embedded in js files')
    .option('-a, --all', 'Crawl for all possible files')
    .description('Crawl github repositories for wat files')
    .action(gitcrawler);

program.parse(process.argv);