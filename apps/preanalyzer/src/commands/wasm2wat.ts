import { getCommandResult } from '../util/util';
import { OptionValues } from 'commander';

export async function wasm2wat(file: string, options: OptionValues) {
    let option = ['./' +file];
    if (options.output) {
        option = option.concat(['-o', options.output]);
    }
    const result = await getCommandResult('wasm2wat', option);
    if (!options.output) {
        console.log('Wasm file converted to wat file: ' + result);
    }
}