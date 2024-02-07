import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export function analyze(file: string) {

    const wasmFiles = file ?
        [file.replace(/\.[^/.]+$/, '')] : readdirSync(process.cwd())
            .filter((file) => path.extname(file).toLowerCase() === '.wasm')
            .map((file) => file.replace(/\.[^/.]+$/, ''));

    const packageMap = new Map<String, any>;
    const packages = readdirSync('./packages').filter((file) => file.endsWith('_package.json'));
    packages.forEach((packageFile) => {
        const packageJson = JSON.parse(readFileSync(path.join('packages', packageFile)).toString());
        const packageLanguages = [];
        if (packageJson.readme) {
            for (let lang of getLanguagesFromString(packageJson.readme)) {
                packageLanguages.push({
                    source: 'readme',
                    language: lang
                });
            }
        }
        if (packageJson.description) {
            for (let lang of getLanguagesFromString(packageJson.description)) {
                packageLanguages.push({
                    source: 'description',
                    language: lang
                });
            }
        }

        delete packageJson.files;
        packageJson.npmLanguages = packageLanguages;
        packageMap.set(packageJson.package, packageJson);
    });


    wasmFiles.forEach((file) => {

        const opcodePath = path.join('opcode', file + '_opcode.json');
        const opcodes = existsSync(opcodePath) ? JSON.parse(readFileSync(opcodePath).toString()) : null;

        const importPath = path.join('import', file + '_import.json');
        const imports = existsSync(importPath) ? JSON.parse(readFileSync(importPath).toString()) : null;

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

        const dataPath = path.join('datadump', file + '_data.json');
        const hasDataSegment = existsSync(dataPath);
        const data = hasDataSegment ? JSON.parse(readFileSync(dataPath).toString()) : [];

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

        // detect rust and cpp file extensions in data section
        const rustPattern = /([A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*)\/([A-Za-z0-9_.-]+\.rs)/;
        let rustMatched = false;
        const cppPattern = /([A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*)\/([A-Za-z0-9_.-]+\.cpp)/;
        let cppMatched = false;
        const goPattern = /([A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*)\/([A-Za-z0-9_.-]+\.go)/;
        let goMatched = false;
        const asPattern = /([A-Za-z0-9_-]\.)+(\/(\.)([A-Za-z0-9_-]\.)+)*\.\.t\.s/;
        let asMatched = false;

        const charLimit = 100000;
        for (let segment of data) {
            const raw = segment.raw.substring(0, charLimit);
            const rustMatch = rustMatched ? null : raw.match(rustPattern);
            if (rustMatch) {
                detectedLanguages.push({
                    source: 'dataExtension',
                    language: 'Rust',
                });
                rustMatched = true;
            }
            const cppMatch = cppMatched ? null : raw.match(cppPattern);
            if (cppMatch) {
                detectedLanguages.push({
                    source: 'dataExtension',
                    language: 'C++',
                });
                cppMatched = true;
            }
            const goMatch = goMatched ? null : raw.match(goPattern);
            if (goMatch) {
                detectedLanguages.push({
                    source: 'dataExtension',
                    language: 'Go',
                });
                goMatched = true;
            }
            const asMatch = asMatched ? null : raw.match(asPattern);
            if (asMatch) {
                detectedLanguages.push({
                    source: 'dataExtension',
                    language: 'AssemblyScript',
                });
                asMatched = true;
            }
            if (rustMatched && cppMatched && goMatched) {
                break;
            }
        }

        let features: string[] = [];

        // language detection via import sources
        if (imports) {
            for (let imp of imports.functions) {
                const source = imp.source.toLowerCase();
                if (source.includes('rust')) {
                    detectedLanguages.push({
                        source: 'import',
                        language: 'Rust'
                    });
                    break;
                }
                if (source.includes('go.runtime')
                    || source.includes('go.syscall')
                    || source.includes('go.interface')
                    || source.includes('go.mem')
                    || source.includes('gojs.')
                    || source.trim() === 'go') {
                    detectedLanguages.push({
                        source: 'import',
                        language: 'Go'
                    });
                    break;
                }
            }
        }


        // mutable-globals feature
        if (imports && imports.globals) {
            for (let global of imports.globals) {
                if (global.mutable) {
                    features.push('mutable-globals');
                    break;
                }
            }
        }

        // feature detection via opcodes
        if (opcodes) {
            features = features.concat(opcodes.features.filter((feature: string) => feature !== 'default'));
        }

        // multi-value feature
        if (functions) {
            for (let func of functions) {
                if (func.returns && func.returns.includes(',')) {
                    features.push('multi-value');
                    break;
                }
            }
        }

        // JS BigInt to Wasm i64 integration
        if (hasBigIntToI64Integration(exports, imports)) {
            features.push('bigint-to-i64');
        }

        // multiple memories feature
        for (let segment of data) {
            if (segment.memoryId && segment.memoryId > 0) {
                features.push('multiple-memories');
                break;
            }
        }


        const packageName = source.package;
        const packageData = packageMap.get(packageName);

        const fileDetails = {
            name: file,
            features: features,
            opcodes: opcodes ? opcodes.opcodes : [],
            imports: imports,
            exports: exports,
            internalFunctions: internalFunctions,
            sections: sections,
            languages: detectedLanguages
        };

        if (!packageData.files) {
            packageData.files = [fileDetails];
        } else {
            packageData.files.push(fileDetails);
        }
        packageMap.set(packageName, packageData);
    });

    const packageArray = Array.from(packageMap.values());
    const totalFiles = packageArray.map((pkg: any) => pkg.files.length).reduce((a: number, b: number) => a + b, 0);

    console.log('Number of files: ' + totalFiles);
    console.log();


    console.log('------Functions------');
    console.log('Average number of exported functions: ' + getAverageNumberOfExportedFunctions(packageArray, totalFiles));
    console.log('Average number of imported functions: ' + getAverageNumberOfImportedFunctions(packageArray, totalFiles));
    console.log();


    console.log('------Opcodes------');
    console.log('Files with opcodes: ' + getNumberOfFilesWithOpcodes(packageArray) + '/' + totalFiles);
    console.log();


    console.log('------Features------');
    const featureMap = getFeatureMap(packageArray);
    console.table(featureMap);
    console.log();


    console.log('------Languages------');
    const npmLanguageMap = getNpmLanguageMap(packageArray);
    const languageMap = getLanguageMap(packageArray);
    console.log('NPM languages:');
    console.table(npmLanguageMap);
    console.log('Detected languages:');
    console.table(languageMap);
    console.log();


    console.log('------Sections------');
    const sectionMap = getSectionMap(packageArray);
    console.table(sectionMap);
    console.log();

    console.log('------Import Sources------');
    const importSourceMap = getImportSourceMap(packageArray);
    console.table(importSourceMap);
    console.log();


    writeFileSync('details.json', JSON.stringify({
        packages: packageArray
    }, null, 2));
}

function getAverageNumberOfExportedFunctions(packageArray: any[], totalFiles: number): number {
    const total = packageArray.map((pkg: any) => pkg.files.map((file: any) => file.exports.length)
        .reduce((a: number, b: number) => a + b, 0))
        .reduce((a: number, b: number) => a + b, 0);
    return Math.round(total / totalFiles * 100) / 100;
}

function getAverageNumberOfImportedFunctions(packageArray: any[], totalFiles: number): number {
    const total = packageArray.map((pkg: any) => pkg.files.map((file: any) => file.imports ? file.imports.functions.length : 0)
        .reduce((a: number, b: number) => a + b, 0))
        .reduce((a: number, b: number) => a + b, 0);
    return Math.round(total / totalFiles * 100) / 100;
}

function getFeatureMap(packageArray: any[]): Map<string, number> {
    const featureMap = new Map<string, number>();
    packageArray.forEach((pkg: any) => pkg.files.forEach((file: any) => file.features.forEach((feature: string) => {
        if (!featureMap.has(feature)) {
            featureMap.set(feature, 1);
        } else {
            featureMap.set(feature, featureMap.get(feature) + 1);
        }
    })));
    return sortMap(featureMap);
}

function getNumberOfFilesWithOpcodes(packageArray: any[]): number {
    return packageArray.map((pkg: any) => pkg.files.filter((file: any) => file.opcodes.length > 0).length)
        .reduce((a: number, b: number) => a + b, 0);
}

function getLanguageMap(packageArray: any[]): Map<string, number> {
    const languageMap = new Map<string, number>();
    packageArray.forEach((pkg: any) => pkg.files.forEach((file: any) => {
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
    }));
    return sortMap(languageMap);
}

function getNpmLanguageMap(packageArray: any[]): Map<string, number> {
    const languageMap = new Map<string, number>();
    packageArray.forEach((pkg: any) => {
        let language;
        if (!pkg.npmLanguages || pkg.npmLanguages.length === 0) {
            language = 'Unknown';
        }
        else {
            language = pkg.npmLanguages.map((lang: any) => lang.language).every((lang: string) => lang === pkg.npmLanguages[0].language) ?
                pkg.npmLanguages[0].language : 'Uncertain';
        }

        if (!languageMap.has(language)) {
            languageMap.set(language, 1);
        } else {
            languageMap.set(language, languageMap.get(language) + 1);
        }
    });
    return sortMap(languageMap);
}

function getSectionMap(packageArray: any[]): Map<string, number> {
    const sectionMap = new Map<string, number>();
    packageArray.forEach((pkg: any) => pkg.files.forEach((file: any) => file.sections.forEach((section: any) => {
        if (!sectionMap.has(section.name)) {
            sectionMap.set(section.name, 1);
        } else {
            sectionMap.set(section.name, sectionMap.get(section.name) + 1);
        }
    })));
    return sortMap(sectionMap);
}

function getImportSourceMap(packageArray: any[]): Map<string, number> {
    const importSourceMap = new Map<string, number>();
    packageArray.forEach((pkg: any) => pkg.files.forEach((file: any) => {
        if (file.imports) {
            file.imports.functions.forEach((func: any) => {
                if (!importSourceMap.has(func.source)) {
                    importSourceMap.set(func.source, 1);
                } else {
                    importSourceMap.set(func.source, importSourceMap.get(func.source) + 1);
                }
            });
        }
    }));
    return sortMap(importSourceMap);
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

function hasBigIntToI64Integration(exports: any[], imports: any): boolean {
    for (let exp of exports) {
        if (exp.returns.includes('i64') || exp.params.includes('i64')) {
            return true;
        }
    }
    if (imports) {
        for (let func of imports.functions) {
            if (func.returns.includes('i64') || func.params.includes('i64')) {
                return true;
            }
        }
        for (let glob of imports.globals) {
            if (glob.type.includes('i64')) {
                return true;
            }
        }
    }
    return false;
}

function getLanguagesFromString(str: string): string[] {
    const languages = ['Rust', 'Go', 'AssemblyScript', 'C++'];
    const detectedLanguages = [];
    for (let lang of languages) {
        if (str.toLowerCase().includes(lang.toLowerCase())) {
            detectedLanguages.push(lang);
        }
    }
    return detectedLanguages;
}


