import {existsSync, mkdirSync, readdirSync} from "fs";
import path from "path";
import {funcls} from "./funcls";
import {opcodels} from "./opcodels";
import {getTypeTable} from "../type/type_parser";

export async function batch() {
    console.log('Batch analyzing wasm files in the directory...');
    const files = readdirSync(process.cwd());
    const wasmFiles = files.filter((file) => path.extname(file).toLowerCase() === '.wasm');
    if (!existsSync('./import')) mkdirSync('./import');
    if (!existsSync('./function')) mkdirSync('./function');
    if (!existsSync('./opcode')) mkdirSync('./opcode');

    for (const file of wasmFiles) {
        const fileName = path.parse(file).name;
        console.log('Analyzing ' + file + '...');

        const types = await getTypeTable(file);

        await funcls(file, {
            type: true,
            output: path.join('function', fileName + '_function.json')
        }, types);

        await funcls(file, {
            type: true,
            import: true,
            sort: 'source',
            output: path.join('import', fileName + '_import.json')
        }, types);

        await opcodels(file, {
            count: true,
            feature: true,
            sort: 'feature',
            output: path.join('opcode', fileName + '_opcode.json')
        });
    }
    console.log('Batch analyzing wasm files in the directory finished!');
}