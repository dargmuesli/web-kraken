import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';


export function analyze(file: string) {

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
                    params: func.params
                };
            }) : [];
        const internalFunctions = functions ? functions
            .filter((func: any) => !func.exported)
            .map((func: any) => {
                return {
                    name: func.name,
                    returns: func.returns,
                    params: func.params
                };
            }) : [];

        const sectionPath = path.join('sections', file + '_section.json');
        const sections = existsSync(sectionPath) ? JSON.parse(readFileSync(sectionPath).toString()) : [];

        const sourcesPath = path.join('sources', file + '_sources.json');
        const source = existsSync(sourcesPath) ? JSON.parse(readFileSync(sourcesPath).toString()) : null;

        const detectedLanguages = [];

        // detect language via producers section
        const languageSection = sections.filter((section: any) => section.name === 'producers' && section.language);
        if (languageSection.length > 0) {
            const languageAndVersion = getLanguageAndVersion(languageSection[0].language);
            detectedLanguages.push({
                source: 'producers',
                language: languageAndVersion.language,
                version: languageAndVersion.version
            });
        }

        // detect go language via buildid or version section
        const goBuildIdSection = sections.filter((section: any) => section.name.includes('go') && section.name.includes('buildid'));
        const goVersionSection = sections.filter((section: any) => section.name.includes('go') && section.name.includes('version'));
        if (goBuildIdSection.length > 0) {
            detectedLanguages.push({
                source: 'go.buildid',
                language: 'Go',
                version: goVersionSection.length > 0 ? goVersionSection[0].raw.replace('.go.version', '') : null
            });
        } else if (goVersionSection.length > 0) {
            detectedLanguages.push({
                source: 'go.version',
                language: 'Go'
            });
        }

        let features: string[] = [];

        if (imports.globals) {
            for (let global of imports.globals) {
                if (global.mutable) {
                    features.push('mutable-globals');
                    break;
                }
            }
        }

        if (opcodes) {
            features = features.concat(opcodes.features);
        }


        return {
            name: file,
            features: features,
            opcodes: opcodes ? opcodes.opcodes : [],
            imports: imports,
            exports: exports,
            internalFunctions: internalFunctions,
            sections: sections,
            source: source,
            languages: detectedLanguages
        };
    });
    console.log('Number of files: ' + fileDetails.length);
    console.log();


    console.log('------Functions------');
    console.log('Average number of exported functions: ' + getAverageNumberOfExportedFunctions(fileDetails));
    console.log('Average number of imported functions: ' + getAverageNumberOfImportedFunctions(fileDetails));
    console.log();


    console.log('------Opcodes------');
    console.log('Files with opcodes: ' + getNumberOfFilesWithOpcodes(fileDetails) + '/' + fileDetails.length);
    console.log();


    console.log('------Features------');
    const featureMap = getFeatureMap(fileDetails);
    console.table(featureMap);
    console.log();


    console.log('------Languages------');
    const languageMap = getLanguageMap(fileDetails);
    console.table(languageMap);
    console.log();

    console.log('------Sections------');
    const sectionMap = getSectionMap(fileDetails);
    console.table(sectionMap);
    console.log();


    writeFileSync('details.json', JSON.stringify(fileDetails, null, 2));
}

function getAverageNumberOfExportedFunctions(fileDetails: any): number {
    const total = fileDetails.map((file: any) => file.exports.length).reduce((a: number, b: number) => a + b, 0);
    const reduce = total / fileDetails.length;
    return Math.round(reduce * 100) / 100;
}

function getAverageNumberOfImportedFunctions(fileDetails: any): number {
    const total = fileDetails.map((file: any) => file.imports.functions ? file.imports.functions.length : 0).reduce((a: number, b: number) => a + b, 0);
    const reduce = total / fileDetails.length;
    return Math.round(reduce * 100) / 100;
}

function getFeatureMap(fileDetails: any): Map<string, number> {
    const featureMap = new Map<string, number>();
    for (const file of fileDetails) {
        for (const feature of file.features) {
            if (!featureMap.has(feature)) {
                featureMap.set(feature, 1);
            } else {
                featureMap.set(feature, featureMap.get(feature) + 1);
            }
        }
    }
    return sortMap(featureMap);
}

function getNumberOfFilesWithOpcodes(fileDetails: any): number {
    return fileDetails.filter((file: any) => file.opcodes.length > 0).length;
}

function getLanguageMap(fileDetails: any): Map<string, number> {
    const languageMap = new Map<string, number>();
    for (const file of fileDetails) {
        let language;
        if (file.languages.length === 0) {
            language = 'Unknown';
        } else {
            language = file.languages.map((lang: any) => lang.language).every((lang: string) => lang === file.languages[0].language) ?
                file.languages[0].language : 'Uncertain';
        }

        if (!languageMap.has(language)) {
            languageMap.set(language, 1);
        } else {
            languageMap.set(language, languageMap.get(language) + 1);
        }
    }
    return sortMap(languageMap);
}

function getSectionMap(fileDetails: any): Map<string, number> {
    const sectionMap = new Map<string, number>();
    for (const file of fileDetails) {
        for (const section of file.sections) {
            if (!sectionMap.has(section.name)) {
                sectionMap.set(section.name, 1);
            } else {
                sectionMap.set(section.name, sectionMap.get(section.name) + 1);
            }
        }
    }
    return sortMap(sectionMap);
}

function sortMap(map: Map<string, number>): Map<string, number> {
    return new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
}

function getLanguageAndVersion(language: string): { language: string, version: string } {
    const languages = ['Rust', 'Go'];
    if (languages.filter((lang) => lang.toLowerCase() === language.toLowerCase()).length > 0) {
        return {
            'language': language,
            'version': null
        };
    }
    for (let lang of languages) {
        if (language.toLowerCase().includes(lang.toLowerCase())) {
            return {
                'language': lang,
                'version': language.replace(lang + '.', '')
            };
        }
    }
    return {
        'language': language,
        'version': null
    };
}
