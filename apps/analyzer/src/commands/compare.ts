import { readFileSync } from 'fs';

export function compare(file1: string, file2: string, options: any) {
    const json1 = JSON.parse(readFileSync(file1).toString());
    const json2 = JSON.parse(readFileSync(file2).toString());

    // opcodes
    const totalOpcodes = Object.keys(json1.opcodes.map).concat(Object.keys(json2.opcodes.map)).filter((value, index, self) => self.indexOf(value) === index);
    const opcodes = totalOpcodes.map((key) => {
        const percentage1 = json1.opcodes.map[key] ? json1.opcodes.map[key] : 0;
        const percentage2 = json2.opcodes.map[key] ? json2.opcodes.map[key] : 0;

        return {
            opcode: key,
            [file1.replace('.json', '')]: percentage1,
            [file2.replace('.json', '')]: percentage2,
            difference: Math.round(Math.abs(percentage1 - percentage2) * 100000) / 100000
        };
    });

    if (options.sortDifference) {
        opcodes.sort((a, b) => {
            if (a.difference < b.difference) {
                return 1;
            }
            if (a.difference > b.difference) {
                return -1;
            }
            return 0;
        });
    }

    // languages
    const totalLanguages =  Object.keys(json1.languages).concat(Object.keys(json2.languages)).filter((value, index, self) => self.indexOf(value) === index);
    const languages = totalLanguages.map((key) => {
        const language1 = json1.languages[key] ? json1.languages[key] : 0;
        const language2 = json2.languages[key] ? json2.languages[key] : 0;
        const total1 = json1.files;
        const total2 = json2.files;

        return {
            language: key,
            [file1.replace('.json', '')]: Math.round(language1 * 10000 / total1) / 100,
            [file2.replace('.json', '')]: Math.round(language2 * 10000 / total2) / 100
        };
    });

    // features
    const totalFeatures = Object.keys(json1.features).concat(Object.keys(json2.features)).filter((value, index, self) => self.indexOf(value) === index);
    const features = totalFeatures.map((key) => {
        const feature1 = json1.features[key] ? json1.features[key] : 0;
        const feature2 = json2.features[key] ? json2.features[key] : 0;
        const total1 = json1.files;
        const total2 = json2.files;

        return {
            feature: key,
            [file1.replace('.json', '')]: Math.round(feature1 * 10000 / total1) / 100,
            [file2.replace('.json', '')]: Math.round(feature2 * 10000 / total2) / 100
        };
    });

    console.log('------- Opcodes -------');
    console.table(opcodes);
    console.log();

    console.log('------- Languages -------');
    console.table(languages);
    console.log();

    console.log('------- Features -------');
    console.table(features);

}