import {childSpawn} from "../util/util";

export function getCustomSectionList(path: string): Promise<string[]> {
    return new Promise((resolve) => {
        const child = childSpawn('wasm-objdump', ['-h', path]);
        let result = '';
        child.stdout.on('data', (data) => {
            result += data.toString();
        });
        child.stdout.on('end', () => {
            resolve(result
                .split(/\n/)
                .filter((line) => line.trim().startsWith('Custom'))
                .map((line) => {
                    return line.substring(line.indexOf('"') + 1, line.lastIndexOf('"'))
                }));
        });
    });
}