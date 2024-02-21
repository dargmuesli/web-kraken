import { Function } from '../entity/function';
//import { Global } from '../../../analyzer/src/entity/global';
import { getTypeTable } from '../type/type_parser';
import { getCommandResult } from '../util/util';
import { functionType } from '../entity/function_type';

export async function getFunctionList(file: string, types?: string[]): Promise<Function[]> {
    const exportList = await getExportList(file);
    const typeList = types ? types : await getTypeTable(file);

    const functionList = await getNonImportFunctionList(file, exportList, typeList);
    const importList = await getImportFunctionList(file, typeList);

    return functionList.concat(importList);
}

export async function getExportList(file: string): Promise<string[]> {
    const result = await getCommandResult('wasm-objdump', ['-x', '-j', 'Export', './' + file]);
    const lines = result.split(/\n/);
    const regex = /"[^"]+"/g;
    const exportList: string[] = [];
    for (let line of lines) {
        const regExpMatchArray = line.match(regex);
        if (!regExpMatchArray) continue;
        exportList.push(regExpMatchArray[0].substring(1, regExpMatchArray[0].length - 1));
    }
    return exportList;
}

export async function getNonImportFunctionList(file: string, exportList: string[], types: string[]): Promise<Function[]> {
    const result = await getCommandResult('wasm-objdump', ['-x', '-j', 'Function', './' + file]);
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
        const type = types[typeIndex].split('->');

        functionList.push(new Function(name, type[0].trim(), type[1].trim(), exportList.indexOf(name) === -1 ? functionType.INTERNAL : functionType.EXPORT));
    }
    return functionList;
}

export async function getImportFunctionList(file: string, types: string[]): Promise<Function[]> {
    const result = await getCommandResult('wasm-objdump', ['-x', '-j', 'Import', './' + file]);
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

        const typeIndex = parseInt(parts[0].split('sig=')[1].split(' ')[0]);
        const type = types[typeIndex].split('->');

        functionList.push(new Function(name, type[0].trim(), type[1].trim(), functionType.IMPORT, source));
    }
    return functionList;
}

export async function hasMutableGlobals(file: string): Promise<boolean> {
    const result = await getCommandResult('wasm-objdump', ['-x', '-j', 'Global', './' + file]);
    const globalIndex = result.indexOf('- global');
    if (globalIndex === -1) return false;
    const functionString = result.substring(globalIndex);
    const lines = functionString.split(/\n/);

    for (const line of lines) {
        if (line.indexOf('mutable=1') !== -1) return true;
    }
    return false;
}

