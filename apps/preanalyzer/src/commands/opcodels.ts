import { getOpcodeList } from '../opcode/opcode_parser';
import { OptionValues } from 'commander';
import fs from 'fs';

export async function opcodels(file: string, options: OptionValues) {
    if (!fs.existsSync(file)) {
        console.error('File does not exist');
        return;
    }

    const opcodeList = await getOpcodeList(file);
    if (opcodeList.length === 0) {
        return;
    }

    if (options.sort === 'name') {
        opcodeList.sort((a: any, b: any) => {
            return a.name.localeCompare(b.name);
        });
    }
    if (options.sort === 'feature') {
        opcodeList.sort((a: any, b: any) => {
            return a.feature.localeCompare(b.feature);
        });
    }

    if (options.output) {
        let output = options.output;
        if (options.output === true) {
            output = file.replace(/\.[^/.]+$/, '') + '_opcode.json';
        }
        fs.writeFileSync(output, JSON.stringify(opcodeList, null, 2));
        return;
    }

    console.log(opcodeList);
}
