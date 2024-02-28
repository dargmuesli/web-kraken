import { Section } from '../entity/section';

export function language_detection(data) {
    const detectedLanguages = [];
    const sections = data.sections;

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
    const goBuildIdSection = sections.filter((section: Section) => section.getName().includes('go') && section.getName().includes('buildid'));
    const goVersionSection = sections.filter((section: Section) => section.getName().includes('go') && section.getName().includes('version'));
    if (goBuildIdSection.length > 0) {
        detectedLanguages.push({
            source: 'go.buildid',
            language: 'Go',
            version: goVersionSection.length > 0 ? goVersionSection[0].getRaw().replace('.go.version', '') : null
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
    for (let segment of data.dataSegments) {
        const raw = segment.getRaw().substring(0, charLimit);
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

    // language detection via import sources
    const importLanguages = getImportLanguages(data);
    detectedLanguages.push(...importLanguages);

    return detectedLanguages;
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

function getImportLanguages(data: any) {
    const importLanguages = [];
    const imports = data.functions.filter((func: any) => func.type === 'IMPORT');

    const hasRustImport = imports.find((func: any) => func.source.toLowerCase().includes('rust')) !== undefined;
    if (hasRustImport) {
        importLanguages.push({
            source: 'import',
            language: 'Rust'
        });
    }

    const hasGoImport = imports.find((func: any) => {
        const source = func.source.toLowerCase();
        return source.includes('go.runtime')
            || source.includes('go.syscall')
            || source.includes('go.interface')
            || source.includes('go.mem')
            || source.includes('gojs.')
            || source.trim() === 'go';
    }) !== undefined;
    if (hasGoImport) {
        importLanguages.push({
            source: 'import',
            language: 'Go'
        });
    }

    return importLanguages;
}