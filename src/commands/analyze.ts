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

    const averageNumberOfExportedFunctions = getAverageNumberOfExportedFunctions(fileDetails);
    const averageNumberOfImportedFunctions = getAverageNumberOfImportedFunctions(fileDetails);
    const percentageOfLanguageKnown = getPercentageOfLanguageKnown(fileDetails);
    console.log('Average number of exported functions: ' + averageNumberOfExportedFunctions);
    console.log('Average number of imported functions: ' + averageNumberOfImportedFunctions);
    console.log('Percentage of language known: ' + percentageOfLanguageKnown + '%');


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

function getPercentageOfLanguageKnown(fileDetails: any): number{
    const total = fileDetails.filter((file: any) => {
        return file.sections.filter((section: any) => section.name === 'producers' && section.language).length > 0;
    }).length;
    const reduce = total / fileDetails.length;
    return Math.round(reduce * 100);
}