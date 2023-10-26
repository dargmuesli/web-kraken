import {childSpawn} from "../util/util";
import {Opcode} from "../entity/opcode";
import {getFeature, getFeatureMap} from "./feature_parser";

export function getOpcodeList(path: string): Promise<Opcode[]> {
    return new Promise((resolve) => {
        const child = childSpawn('wasm-opcodecnt', [path, '--enable-all']);
        let result = '';
        child.stdout.on('data', (data) => {
            result += data.toString();
        });
        const opcodeList: Opcode[] = [];
        child.stdout.on('end', () => {
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
            resolve(opcodeList);
        });
    });
}