import { getCommandResult } from '../util/util';
export async function getTypeTable(path: string): Promise<string[]> {
    const result = await getCommandResult('wasm-objdump', ['-x', '-j', 'Type', './' + path]);
    const types: string[] = [];
    const typeString = result.substring(result.indexOf('- type'));
    const lines = typeString.split(/\n/);
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('type') === -1) continue;
        types[i] = lines[i].substring(lines[i].indexOf(']') + 1).trim();
    }
    return types;
}
