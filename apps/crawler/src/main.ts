#! /usr/bin/env node

import {Command} from "commander";
import {npm} from "./commands/npm";
import {gitcrawler} from "./commands/gitcrawler";
import { groupsources } from './commands/groupsources';
import { npmdata } from './commands/npmdata';

const program = new Command();

program
    .command('npm <db>')
    .description('Crawl npm packages for wasm files')
    .option('-b, --bookmark <bookmark>', 'Bookmark to start crawling from')
    .option('-p, --path <file>', 'Path to save the crawled files')
    .action(npm);

program
    .command('gitcrawler <token>')
    .option('-n, --number <number>', 'Number of results to crawl')
    .option('-m, --magic', 'Use magic number to detect wasm files embedded in js files')
    .option('-a, --all', 'Crawl for all possible files')
    .description('Crawl github repositories for wat files')
    .action(gitcrawler);

program
    .command('groupsources')
    .description('Group source files')
    .action(groupsources)

program
    .command('npmdata')
    .description('Get data from npm packages')
    .action(npmdata)

program.parse(process.argv);
