import { OptionValues } from 'commander';
import fs, { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { getDataSections } from '../data/data_parser';
import { getFunctionList, hasMutableGlobals } from '../function/function_parser';
import { getOpcodeList } from '../opcode/opcode_parser';
import { getCustomSectionList } from '../section/section_parser';

export async function batch(options: OptionValues) {
    console.log('Batch analyzing wasm files in the directory...');

    const input: string[] = options.jsonInput ? JSON.parse(readFileSync(options.jsonInput).toString()) : null;
    const files = readdirSync(process.cwd()).filter((file) => path.extname(file).toLowerCase() === '.wasm' && (!input || input.includes(file)));

    if (!files.length) {
        console.log('No wasm files found');
        return;
    }

    if (!existsSync('./data')) mkdirSync('./data');

    for (const file of files) {
        console.log('Analyzing ' + file + '...');

        const dataSegments = await getDataSections(file);
        const functions = await getFunctionList(file);
        const opcodes = await getOpcodeList(file);
        const sections = await getCustomSectionList(file);
        const features = await hasMutableGlobals(file) ? ['mutable-globals'] : [];

        const details = {
            dataSegments,
            functions,
            opcodes,
            sections,
            features
        };
        fs.writeFileSync( './data/' + file.replace(/\.[^/.]+$/, "") + '_data.json', JSON.stringify(details, null, 2));
    }
}
