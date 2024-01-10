import {getCommandResult} from "../util/util";
import {Function} from "../entity/function";
import { Global } from '../entity/global';

export async function getFunctionList(path: string): Promise<Function[]> {
    const exportList = await getExportList(path);

    const result = await getCommandResult('wasm-objdump', ['-x', '-j', 'Function', './' + path]);
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

        functionList.push(new Function(name, typeIndex, exportList.indexOf(name) !== -1));
    }
    return functionList;
}

export async function getImportList(path: string): Promise<Function[]> {
    const result = await getCommandResult('wasm-objdump', ['-x', '-j', 'Import', './' + path]);
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
        functionList.push(new Function(name, type, undefined, source));
    }
    return functionList;
}

export async function getExportList(path: string): Promise<String[]> {
    const result = await getCommandResult('wasm-objdump', ['-x', '-j', 'Export', './' + path]);
    const lines = result.split(/\n/);
    const regex = /"[^"]+"/g;
    const exportList: String[] = [];
    for (let line of lines) {
        const regExpMatchArray = line.match(regex);
        if (!regExpMatchArray) continue;
        exportList.push(regExpMatchArray[0].substring(1, regExpMatchArray[0].length - 1));
    }
    return exportList;
}

export async function getImportedGlobalList(path: string): Promise<Global[]> {
    const result = await getCommandResult('wasm-objdump', ['-x', '-j', 'Import', './' + path]);
    const functionString = result.substring(result.indexOf('- global'));
    const lines = functionString.split(/\n/);
    const importedGlobalList: Global[] = [];

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('global') === -1) continue;
        // - global[3] i32 mutable=1 <- GOT.func.PyAIter_Check
        const parts = lines[i].split('<-');
        const mutableIndex = parts[0].indexOf('mutable=');
        const mutable: boolean | undefined = mutableIndex !== -1 ? (parts[0].charAt(mutableIndex + 'mutable='.length) === '1') : undefined;

        const cutIndex = parts[1].lastIndexOf('.');
        const source = parts[1].substring(0, cutIndex);
        const name = parts[1].substring(cutIndex + 1);
        importedGlobalList.push(new Global(name, source, mutable));
    }
    return importedGlobalList;
}

