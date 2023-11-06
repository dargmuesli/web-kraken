import {getCommandResult} from "../util/util";
import {Opcode} from "../entity/opcode";
import {getFeature, getFeatureMap} from "./feature_parser";

export async function getOpcodeList(path: string): Promise<Opcode[]> {
    const result = await getCommandResult('wasm-opcodecnt', [path, '--enable-all']);
    const opcodeList: Opcode[] = [];
    let strings = result.split(/\n\s*\n/);  // strings[0] == total, strings[1] == opcodes
    const total = parseInt(strings[0].split(': ')[1]);
    let lines = strings[1].split(/\n/);

    const featureMap = getFeatureMap();
    for (let i = 1; i < lines.length; i++) {
        let parts = lines[i].split(/:/);
        let opcode = parts[0].trim();

        let count = parseInt(parts[1].trim());
        const percentage = (count / total * 100).toFixed(5);
        opcodeList.push(new Opcode(opcode, count, percentage, getFeature(opcode, featureMap)));
    }
    return opcodeList;
}