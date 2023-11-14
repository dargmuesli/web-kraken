import {getCommandResult} from "../util/util";
import {Function} from "../entity/function";

export async function getFunctionList(path: string): Promise<Function[]> {
    const result = await getCommandResult('wasm-objdump', ['-x', '-j', 'Function', path]);
    const functionString = result.substring(result.indexOf('- func'));
    const lines = functionString.split(/\n/);
    const functionList: Function[] = [];

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('func') === -1) continue;

        const regExp = /<([^>]+)>/;
        const matches = lines[i].match(regExp);
        if (!matches) continue;
        let name = matches[1];

        const sigIndex = lines[i].indexOf('sig=') + 'sig='.length;
        const typeIndex = parseInt(lines[i].substring(sigIndex, sigIndex + 1));

        functionList.push(new Function(name, typeIndex));
    }
    return functionList;
}

export async function getImportList(path: string): Promise<Function[]> {
    const result = await getCommandResult('wasm-objdump', ['-x', '-j', 'Import', path]);
    const functionString = result.substring(result.indexOf('- func'));
    const lines = functionString.split(/\n/);
    const functionList: Function[] = [];

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('func') === -1) continue;
        if (lines[i].indexOf('sig=') === -1) continue;
        const parts = lines[i].split('<-');

        const cutIndex = parts[1].lastIndexOf('.');
        const source = parts[1].substring(0, cutIndex);
        const name = parts[1].substring(cutIndex + 1);

        const type = parseInt(parts[0].split('sig=')[1].split(' ')[0]);
        functionList.push(new Function(name, type, source));
    }
    return functionList;
}