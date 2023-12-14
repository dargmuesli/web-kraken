import {existsSync, readdirSync, readFileSync, writeFileSync} from "fs";
import path from "path";
import {OptionValues} from "commander";


export function analyze(file: string, options: OptionValues) {

    const wasmFiles = file ?
        [file.replace('.wasm', '')] : readdirSync(process.cwd())
            .filter((file) => path.extname(file).toLowerCase() === '.wasm')
            .map((file) => file.replace('.wasm', ''));


    const fileDetails = wasmFiles.map((file) => {

        const opcodePath = path.join('opcode', file + '_opcode.json');
        const opcodes = existsSync(opcodePath) ? JSON.parse(readFileSync(opcodePath).toString()) : null;

        const importPath = path.join('import', file + '_import.json');
        const imports = existsSync(importPath) ? JSON.parse(readFileSync(importPath).toString()) : [];

        const functionPath = path.join('function', file + '_function.json');
        const functions = existsSync(functionPath) ? JSON.parse(readFileSync(functionPath).toString()) : null;
        const exports = functions ? functions
            .filter((func: any) => func.exported)
            .map((func: any) => {
                return {
                    name: func.name,
                    returns: func.returns,
                    params: func.params,
                }
            }): [];
        const internalFunctions = functions ? functions
            .filter((func: any) => !func.exported)
            .map((func: any) => {
                return {
                    name: func.name,
                    returns: func.returns,
                    params: func.params
                }
            }): [];

        const sectionPath = path.join('sections', file + '_section.json');
        const sections = existsSync(sectionPath) ? JSON.parse(readFileSync(sectionPath).toString()) : [];

        const sourcesPath = path.join('sources', file + '_sources.json');
        const source = existsSync(sourcesPath) ? JSON.parse(readFileSync(sourcesPath).toString()) : null;

        return {
            name: file,
            features: opcodes ? opcodes.features : [],
            opcodes: opcodes ? opcodes.opcodes : [],
            imports: imports,
            exports: exports,
            internalFunctions: internalFunctions,
            sections: sections,
            source: source
        }
    });
    console.log('Number of files: ' + fileDetails.length);
    console.log('Average number of exported functions: ' + getAverageNumberOfExportedFunctions(fileDetails));
    console.log('Average number of imported functions: ' + getAverageNumberOfImportedFunctions(fileDetails));
    console.log('With detected features: ' + getNumberOfWasmsWithFeatures(fileDetails) + '/' + fileDetails.length);

    // JSON.stringify(getLanguageMap(fileDetails), null, 2)
    const languageMap = new Map([...getLanguageMap(fileDetails).entries()].sort((a, b) => b[1] - a[1]));
    const numberOfLanguagesKnown = Array.from(languageMap.values()).reduce((a, b) => a + b, 0);
    console.log('Language known: ' + numberOfLanguagesKnown + '/' + fileDetails.length);
    console.log('Language map: ');
    for (const [language, count] of languageMap) {
        console.log(language + ': ' + count);
    }


    writeFileSync('details.json', JSON.stringify(fileDetails, null, 2));
}

function getAverageNumberOfExportedFunctions(fileDetails: any): number {
    const total = fileDetails.map((file: any) => file.exports.length).reduce((a: number, b: number) => a + b, 0);
    const reduce = total / fileDetails.length;
    return Math.round(reduce * 100) / 100;
}

function getAverageNumberOfImportedFunctions(fileDetails: any): number {
    const total = fileDetails.map((file: any) => file.imports.length).reduce((a: number, b: number) => a + b, 0);
    const reduce = total / fileDetails.length;
    return Math.round(reduce * 100) / 100;
}

function getNumberOfWasmsWithFeatures(fileDetails: any): number{
    return fileDetails.filter((file: any) => {
        const number = file.features.indexOf('default') === -1 ? 0 : 1;
        return file.features.length > number;
    }).length;
}

function getLanguageMap(fileDetails: any): Map<string, number> {
    const languageMap = new Map<string, number>();
    for (const file of fileDetails) {
        const language = file.sections.filter((section: any) => section.name === 'producers' && section.language)[0]?.language;
        if (!language) continue;
        if (!languageMap.has(language)) {
            languageMap.set(language, 1);
        } else {
            languageMap.set(language, languageMap.get(language) + 1);
        }
    }
    return languageMap;
}
