import { getCommandResult } from '../util/util';
import { OptionValues } from 'commander';
import fs from 'fs';
import { Data } from '../entity/data';


export async function datadump(file: string, options: OptionValues) {
    const result = await getCommandResult('wasm-objdump', ['./' + file, '-x', '-j', 'Data']);
    const dataString = result.split(/Data\[[0-9]+]:/g)[1];
    const lines = dataString.split(/\n/);

    let currentSize = -1;
    let currentData = '';
    let currentMemory = -1;
    const segments: Data[] = [];

    lines.forEach((line) => {
        if (line.startsWith(' - segment[')) {
            if (currentSize !== -1 && currentMemory !== -1) {
                segments.push(new Data(currentMemory, currentData));
                currentSize = -1;
                currentData = '';
                currentMemory = -1;
            }
            // - segment[0] memory=0 size=13972 - init i32=1024
            currentSize = parseInt(line.split('size=')[1].split(' ')[0]);
            currentMemory = parseInt(line.split('memory=')[1].split(' ')[0]);
            return;
        }
        const diff = Math.min(currentSize, 16);
        currentData += line.substring(line.length - diff);
        currentSize -= diff;
    });
    segments.push(new Data(currentMemory, currentData));


    if (options.output) {
        let output = options.output;
        if (options.output === true) {
            output = file.replace(/\.[^/.]+$/, "") + '.json';
        }
        fs.writeFileSync(output, JSON.stringify(segments, null, 2));
        return;
    }
    console.log(segments);
}