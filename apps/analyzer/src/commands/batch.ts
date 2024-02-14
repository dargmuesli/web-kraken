import { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { OptionValues } from 'commander';
import { wasm2wat } from './wasm2wat';
import { objdump } from './objdump';

export async function batch(options: OptionValues) {
    console.log('Batch analyzing wasm files in the directory...');
    if (Object.keys(options).length === 0) {
        options = { 'import': true, 'function': true, 'opcode': true, 'section': true };
    }

    const input: string[] = options.jsonInput ? JSON.parse(readFileSync(options.jsonInput).toString()) : null;

    const files = readdirSync(process.cwd());
    let wasmFiles = files.filter((file) => path.extname(file).toLowerCase() === '.wasm' && (!input || input.includes(file)));
    if (!existsSync('./wat') && options.convert) mkdirSync('./wat');
    if (!existsSync('./objdump') && options.dump) mkdirSync('./objdump');

    for (const file of wasmFiles) {
        const fileName = path.parse(file).name;
        console.log('Analyzing ' + file + '...');

        if (options.convert) {
            try {
                await wasm2wat(file, {
                    output: path.join('wat', fileName + '.wat')
                });
            } catch (e) {
                console.log(e);
            }
        }

        if (options.dump) {
            try {
                await objdump(file, {
                    output: path.join('objdump', fileName + '.txt')
                });
            } catch (e) {
                console.log(e);
            }
        }
    }

    console.log('Batch analyzing wasm files in the directory finished!');
}
