import { readdirSync, readFileSync } from 'fs';
import path from 'path';

export function language(file: string) {
    const name = file.replace(/\.[^/.]+$/, "");

    console.log('File name: ' + file);

    const data = JSON.parse(readFileSync(path.join('data', name + '_data.json')).toString());

    const packages= readdirSync('./packages').filter((file) => file.endsWith('_package.json'));

    let packageName = '';
    let sourceJson = null;

    for (const pkg of packages) {
        sourceJson = JSON.parse(readFileSync('./packages/' + pkg).toString());
        if (sourceJson['files'].includes(name)) {
            packageName = pkg;
            break;
        }
        sourceJson = null;
    }


    const high = ['producers', 'go.buildid', 'go.version'];
    const medium = ['import'];
    const low = ['dataExtension'];

    const detectedLanguages = data.languages.map((language: any) => {
        const level = high.includes(language.source) ? 'high' : medium.includes(language.source) ? 'medium' : low.includes(language.source) ? 'low' : 'unknown';
        return {
            language: language.language,
            source: language.source,
            certainty: level
        };
    });

    if (!sourceJson) {
        console.log('No package found');
        return;
    }

    console.log('Package name: ' + packageName);
    console.log();

    console.log('Detected languages:');
    console.table(detectedLanguages);

    const packageLanguages = sourceJson['languages'];
    if (sourceJson['git-languages']) {
        Object.keys(sourceJson['git-languages']).forEach((key) => {
            packageLanguages.push({
                source: 'git',
                language: key
            });
        })
    }

    console.log('Package languages:');
    console.table(packageLanguages);


}