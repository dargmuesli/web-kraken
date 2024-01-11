import { OptionValues } from 'commander';
import { getCommandResult } from '../util/util';
import fs from 'fs';

export async function objdump(file: string, options: OptionValues) {
    const result = await getCommandResult('wasm-objdump', ['-x','-d', './' + file]);
    if (options.output) {
        let output = options.output;
        if (options.output === true) {
            output = file.replace(/\.[^/.]+$/, "") + '.txt';
        }
        fs.writeFileSync(output, result);
        return;
    }
    console.log(result);
}