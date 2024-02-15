import { readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { OptionValues } from 'commander';

export function groupAnalyze(options: OptionValues) {

    const jsonInput = options.jsonInput ? JSON.parse(readFileSync(options.jsonInput).toString()) : null;
    const files = readdirSync(path.join(process.cwd(), 'data_extended'))
        .filter((file) => file.endsWith('_data_extended.json') && (!jsonInput || jsonInput.includes(file.replace('_data_extended.json', ''))));

    const totalFiles = files.length;

    let importedFunctions = 0;
    let exportedFunctions = 0;
    let internalFunctions = 0;

    let filesWithOpcodes = 0;

    let sectionMap = new Map<string, number>();
    let featureMap = new Map<string, number>();
    let languageMap = new Map<string, number>();
    let opcodeMap = new Map<string, number>();

    files.forEach((file) => {
        const data = JSON.parse(readFileSync(path.join('data_extended', file)).toString());

        const imports = data.functions.filter((func: any) => func.type === 'IMPORT');

        // functions
        importedFunctions += imports.length;
        exportedFunctions += data.functions.filter((func: any) => func.type === 'EXPORT').length;
        internalFunctions += data.functions.filter((func: any) => func.type === 'INTERNAL').length;

        // opcodes
        if (data.opcodes.length > 0) {
            filesWithOpcodes++;
        }
        data.opcodes.forEach((opcode) => {
            const percentage: number = parseFloat(opcode.percentage);
            opcodeMap.set(opcode.name, opcodeMap.has(opcode.name) ? opcodeMap.get(opcode.name) + percentage : percentage);
        });

        // sections
        data.sections.forEach((section: any) => {
            sectionMap.set(section.name, sectionMap.has(section.name) ? sectionMap.get(section.name) + 1 : 1);
        });

        // features
        data.features.forEach((feature: string) => {
            featureMap.set(feature, featureMap.has(feature) ? featureMap.get(feature) + 1 : 1);
        });

        // languages
        const detectedLanguages = data.languages.map((language: any) => language.language).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
        switch (detectedLanguages.length) {
            case 0:
                languageMap.set('unknown', languageMap.has('unknown') ? languageMap.get('unknown') + 1 : 1);
                break;
            case 1:
                languageMap.set(detectedLanguages[0], languageMap.has(detectedLanguages[0]) ? languageMap.get(detectedLanguages[0]) + 1 : 1);
                break;
            default:
                languageMap.set('multiple', languageMap.has('multiple') ? languageMap.get('multiple') + 1 : 1);
        }
    });

    // round the values of the opcodeMap to 5 decimal places
    opcodeMap = new Map([...opcodeMap.entries()].map(([key, value]) => [key, Math.round(value * 100000 / filesWithOpcodes) / 100000]));

    sectionMap = sortMap(sectionMap);
    featureMap = sortMap(featureMap);
    languageMap = sortMap(languageMap);
    opcodeMap = sortMap(opcodeMap);

    const averageImportedFunctions = Math.round(importedFunctions / totalFiles * 100) / 100;
    const averageExportedFunctions = Math.round(exportedFunctions / totalFiles * 100) / 100;
    const averageInternalFunctions = Math.round(internalFunctions / totalFiles * 100) / 100;

    if (options.output) {
        const output = {
            files: totalFiles,
            functions: {
                imported: averageImportedFunctions,
                exported: averageExportedFunctions,
                internal: averageInternalFunctions
            },
            opcodes: {
                filesWithOpcodes,
                'map': Object.fromEntries(opcodeMap)
            },
            sections: Object.fromEntries(sectionMap),
            features: Object.fromEntries(featureMap),
            languages: Object.fromEntries(languageMap)
        };
        writeFileSync(options.output, JSON.stringify(output, null, 2));
        return;
    }


    console.log('Number of files: ' + files.length);
    console.log();

    console.log('------Functions------');
    console.log('Average number of imported functions: ' + averageImportedFunctions);
    console.log('Average number of exported functions: ' + averageExportedFunctions);
    console.log('Average number of internal functions: ' + averageInternalFunctions);
    console.log();

    console.log('------Opcodes------');
    console.log('Files with opcodes: ' + filesWithOpcodes + '/' + totalFiles);
    console.log();

    console.log('------Sections------');
    console.table(sectionMap);
    console.log();
    console.log('------Features------');
    console.table(featureMap);
    console.log();

    console.log('------Languages------');
    console.log('Detected languages:');
    console.table(languageMap);
    console.log();
}

function sortMap(map: Map<string, number>): Map<string, number> {
    return new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
}