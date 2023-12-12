import {existsSync, mkdirSync, readdirSync} from "fs";
import path from "path";
import {funcls} from "./funcls";
import {opcodels} from "./opcodels";
import {getTypeTable} from "../type/type_parser";
import {sectionls} from "./sectionls";
import {OptionValues} from "commander";

export async function batch(options: OptionValues) {
    console.log('Batch analyzing wasm files in the directory...');
    const files = readdirSync(process.cwd());
    const wasmFiles = files.filter((file) => path.extname(file).toLowerCase() === '.wasm');
    if (!existsSync('./import') && options.import) mkdirSync('./import');
    if (!existsSync('./function') && options.function) mkdirSync('./function');
    if (!existsSync('./opcode') && options.opcode) mkdirSync('./opcode');
    if (!existsSync('./sections') && options.section) mkdirSync('./sections');

    for (const file of wasmFiles) {
        const fileName = path.parse(file).name;
        console.log('Analyzing ' + file + '...');

        const types = await getTypeTable(file);

        if (options.function) {
            try {
                await funcls(file, {
                    type: true,
                    output: path.join('function', fileName + '_function.json')
                }, types);
            } catch (e) {
                console.log(e)
            }
        }

        if (options.import) {
            try {
                await funcls(file, {
                    type: true,
                    import: true,
                    sort: 'source',
                    output: path.join('import', fileName + '_import.json')
                }, types);
            } catch (e) {
                console.log(e)
            }
        }

        if (options.opcode) {
            try {
                await opcodels(file, {
                    count: true,
                    feature: true,
                    sort: 'feature',
                    output: path.join('opcode', fileName + '_opcode.json')
                });
            } catch (e) {
                console.log(e)
            }
        }

        if (options.section) {
            try {
                await sectionls(file, {
                    output: path.join('sections', fileName + '_section.json')
                });
            } catch (e) {
                console.log(e)
            }
        }
    }
    console.log('Batch analyzing wasm files in the directory finished!');
}