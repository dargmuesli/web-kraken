import {readdirSync, readFileSync} from "fs";

export function getFeatureMap(): Map<string, string[]> {
    let root = __dirname.substring(0, __dirname.lastIndexOf('\\'));
    root = root.substring(0, root.lastIndexOf('\\'));
    const folder = root + '\\src\\resources\\features\\';

    const files = readdirSync(folder);
    const featureMap = new Map<string, string[]>();
    for (const file of files) {
        const name = file.substring(0, file.lastIndexOf('.'));
        const opcodes = readFileSync(folder + file).toString().split(/\n/).map((line) => line.trim());
        featureMap.set(name, opcodes);
    }
    return featureMap;
}

export function getFeature(opcode: string, featureMap: Map<string, string[]>): string | undefined {
    for (const [feature, opcodes] of featureMap) {
        if (opcodes.indexOf(opcode) !== -1) {
            return feature;
        }
    }
    return undefined;
}