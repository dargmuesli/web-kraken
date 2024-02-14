import { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import path from "path";
import PouchDB from 'pouchdb';
import {funcls} from "./funcls";
import {opcodels} from "./opcodels";
import {getTypeTable} from "../type/type_parser";
import {sectionls} from "../../../preanalyzer/src/commands/sectionls";
import {OptionValues} from "commander";
import { wasm2wat } from './wasm2wat';
import { objdump } from './objdump';
import { npmdata } from './npmdata';
import { datadump } from '../../../preanalyzer/src/commands/datadump';

export async function batch(options: OptionValues) {
    console.log('Batch analyzing wasm files in the directory...');
    if (Object.keys(options).length === 0) {
        options = {"import": true, "function": true, "opcode": true, "section": true};
    }

    const input: string[] = options.jsonInput ? JSON.parse(readFileSync(options.jsonInput).toString()) : null;

    const files = readdirSync(process.cwd());
    let wasmFiles = files.filter((file) => path.extname(file).toLowerCase() === '.wasm' && (!input || input.includes(file)));
    if (!existsSync('./import') && options.import) mkdirSync('./import');
    if (!existsSync('./function') && options.function) mkdirSync('./function');
    if (!existsSync('./opcode') && options.opcode) mkdirSync('./opcode');
    if (!existsSync('./sections') && options.section) mkdirSync('./sections');
    if (!existsSync('./wat') && options.convert) mkdirSync('./wat');
    if (!existsSync('./objdump') && options.dump) mkdirSync('./objdump');
    if (!existsSync('./datadump') && options.datadump) mkdirSync('./datadump');

    if (!(options.import || options.function || options.opcode || options.section || options.convert || options.dump || options.datadump)) {
        wasmFiles = [];
    }

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

        if (options.convert) {
            try {
                await wasm2wat(file, {
                    output: path.join('wat', fileName + '.wat')
                });
            } catch (e) {
                console.log(e)
            }
        }

        if (options.dump) {
            try {
                await objdump(file, {
                    output: path.join('objdump', fileName + '.txt')
                });
            } catch (e) {
                console.log(e)
            }
        }

        if (options.datadump) {
            try {
                await datadump(file, {
                    output: path.join('datadump', fileName + '_data.json')
                });
            } catch (e) {
                console.log(e)
            }
        }
    }

    if (options.npmdata && existsSync('packages')) {
        const files = readdirSync('packages');
        const sources = files.filter((file) => file.endsWith('_package.json'));
        const dataBase = new PouchDB('https://skimdb.npmjs.com/registry');
        for (const source of sources) {
            console.log('Getting npm data from ' + source + '...');
            try {
                await npmdata(path.join('packages', source), {
                    db: true
                }, dataBase);
            } catch (e) {
                console.log(e)
            }
        }
    }

    console.log('Batch analyzing wasm files in the directory finished!');
}
