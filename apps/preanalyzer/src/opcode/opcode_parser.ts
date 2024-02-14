import { Opcode } from '../entity/opcode';
import { getFeature } from './feature_parser';
import { getCommandResult } from '../util/util';

export async function getOpcodeList(path: string): Promise<Opcode[]> {
    const result = await getCommandResult('wasm-opcodecnt', ['./' + path, '--enable-all']);
    if (result === '') {
        return [];
    }

    const opcodeList: Opcode[] = [];
    const strings = result.split(/\n\s*\n/);  // strings[0] == total, strings[1] == opcodes
    const total = parseInt(strings[0].split(': ')[1]);
    const lines = strings[1].split(/\n/);

    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(/:/);
        const opcode = parts[0].trim();

        const count = parseInt(parts[1].trim());
        const percentage = (count / total * 100).toFixed(5);
        const feature = getFeature(opcode);
        if (feature === undefined) {
            console.log(path + ': ' + opcode);
        }
        opcodeList.push(new Opcode(opcode, count, percentage, feature));
    }
    return opcodeList;
}
