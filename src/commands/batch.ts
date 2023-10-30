import {existsSync, mkdirSync, readdirSync} from "fs";
import path from "path";
import {funcls} from "./funcls";
import {opcodels} from "./opcodels";

export async function batch() {
    console.log('Batch analyzing wasm files in the directory...');
    const files = readdirSync(process.cwd());
    const wasmFiles = files.filter((file) => path.extname(file).toLowerCase() === '.wasm');
    if (!existsSync('./import')) mkdirSync('./import');
    if (!existsSync('./function')) mkdirSync('./function');
    if (!existsSync('./opcode')) mkdirSync('./opcode');

    for (const file of wasmFiles) {
        await funcls(file, {
            type: true,
            output: './function/' + file.replace(/\.[^/.]+$/, "") + '_function.json'
        });

        await funcls(file, {
            type: true,
            import: true,
            sort: 'source',
            output: './import/' + file.replace(/\.[^/.]+$/, "") + '_import.json'

        });

        await opcodels(file, {
            count: true,
            feature: true,
            sort: 'feature',
            output: './opcode/' + file.replace(/\.[^/.]+$/, "") + '_opcode.json'
        });
    }

    console.log('Batch analyzing wasm files in the directory finished!');
}