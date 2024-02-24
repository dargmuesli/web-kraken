import { readFileSync } from 'fs';
import { OptionValues } from 'commander';

export function compare(file1: string, file2: string, options: OptionValues) {
    const json1 = JSON.parse(readFileSync(file1).toString());
    const json2 = JSON.parse(readFileSync(file2).toString());

    // opcodes
    console.log('------- Opcodes -------');
    const map1 = new Map<string, number>();
    const map2 = new Map<string, number>();
    for (const opcode of Object.keys(json1.opcodes.map)) {
        map1.set(opcode, json1.opcodes.map[opcode]);
    }
    for (const opcode of Object.keys(json2.opcodes.map)) {
        map2.set(opcode, json2.opcodes.map[opcode]);
    }

    const opcodes = compareMaps(map1, map2, file1, file2, options.thresholds[0] ? parseFloat(options.thresholds[0]) : 0);
    console.log('Full opcodes:')
    console.table(opcodes);
    console.log();

    const typeMap1 = new Map<string, number>();
    const typeMap2 = new Map<string, number>();
    const operationMap1 = new Map<string, number>();
    const operationMap2 = new Map<string, number>();

    splitOpcodes(json1, typeMap1, operationMap1);
    splitOpcodes(json2, typeMap2, operationMap2);

    console.log('Only types:')
    const types = compareMaps(typeMap1, typeMap2, file1, file2, options.thresholds[1] ? parseFloat(options.thresholds[1]) : 0);
    console.table(types);
    console.log();

    console.log('Only operations:')
    const operations = compareMaps(operationMap1, operationMap2, file1, file2, options.thresholds[2] ? parseFloat(options.thresholds[2]) : 0);
    console.table(operations);
    console.log();

    console.log('Signed/Unsigned:')
    const signMap1 = new Map<string, number>();
    const signMap2 = new Map<string, number>();
    splitSigned(json1, signMap1);
    splitSigned(json2, signMap2);
    const signed = compareMaps(signMap1, signMap2, file1, file2);
    console.table(signed);
    console.log();




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



    console.log('------- Languages -------');
    console.table(languages);
    console.log();

    console.log('------- Features -------');
    console.table(features);
}

function splitOpcodes(json: any, typeMap: Map<string, number>, operationMap: Map<string, number>) {
    for (const opcode of Object.keys(json.opcodes.map)) {
        if (!opcode.includes('.')) continue;

        /*
            example: i32.atomic.rmw.xchg
            type: i32
            operation: atomic.rmw.xchg
         */
        const type = opcode.split('.')[0];
        const operation = opcode.split('.').slice(1).join('.');

        typeMap.set(type, (typeMap.get(type) || 0) + json.opcodes.map[opcode]);
        operationMap.set(operation, (operationMap.get(operation) || 0) + json.opcodes.map[opcode]);
    }

    // round values to 5 decimal places
    for (const key of typeMap.keys()) {
        typeMap.set(key, Math.round(typeMap.get(key) * 100000) / 100000);
    }

    for (const key of operationMap.keys()) {
        operationMap.set(key, Math.round(operationMap.get(key) * 100000) / 100000);
    }
}

function splitSigned(json: any, signMap: Map<string, number>) {
    for (const opcode of Object.keys(json.opcodes.map)) {
        if (!opcode.endsWith('_u') && !opcode.endsWith('_s')) continue;

        const sign = opcode.endsWith('_u') ? 'unsigned' : 'signed';
        signMap.set(sign, (signMap.get(sign) || 0) + json.opcodes.map[opcode]);
    }

    // round values to 5 decimal places
    for (const key of signMap.keys()) {
        signMap.set(key, Math.round(signMap.get(key) * 100000) / 100000);
    }
}

function compareMaps(map1: Map<string, number>, map2: Map<string, number>, file1: string, file2: string, threshold: number = 0) {
    const totalOpcodes = Array.from(map1.keys()).concat(Array.from(map2.keys())).filter((value, index, self) => self.indexOf(value) === index);
    const opcodes = totalOpcodes
        .filter((value) => map1.get(value) > threshold || map2.get(value) > threshold)
        .map((key) => {
        const percentage1 = map1.has(key) ? map1.get(key) : 0;
        const percentage2 = map2.has(key) ? map2.get(key) : 0;


        let change = Math.log(percentage1 / percentage2) / Math.log(2);
        if (percentage1 === 0 || percentage2 === 0) change = 0;

        // round change to 5 decimal places
        change = Math.round(change * 100000) / 100000;

        return {
            opcode: key,
            [file1.replace('.json', '')]: percentage1,
            [file2.replace('.json', '')]: percentage2,
            log_diff: change
        };
    });

    opcodes.sort((a, b) => {
        if (Math.abs(a.log_diff) < Math.abs(b.log_diff)) {
            return 1;
        }
        if (Math.abs(a.log_diff) > Math.abs(b.log_diff)) {
            return -1;
        }
        return 0;
    });

    return opcodes;
}

