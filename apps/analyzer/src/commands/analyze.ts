import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { language_detection } from '../language/language_detection';
import { feature_detection } from '../features/feature_detection';

export function analyze() {
    if (!existsSync('./data_extended')) mkdirSync('./data_extended');

    const files = readdirSync(path.join(process.cwd(), 'data'))
        .filter((file) => path.extname(file).toLowerCase() === '.json');
        //.map((file) => file.replace(/\.[^/.]+$/, ''));

    files.forEach((file) => {
        const data = JSON.parse(readFileSync(path.join('data', file)).toString());

        const languages = language_detection(data);
        const features = feature_detection(data);

        data['languages'] = languages;
        data['features'] = features;

        writeFileSync(path.join('data_extended', file.replace('_data.json', '_data_extended.json')), JSON.stringify(data, null, 2));
    });

    /*
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

     */
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


