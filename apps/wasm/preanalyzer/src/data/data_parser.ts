import { Data } from '../entity/data';
import { getCommandResult } from '../util/util';

export async function getDataSections(file: string): Promise<Data[]> {
    const result = await getCommandResult('wasm-objdump', ['./' + file, '-x', '-j', 'Data']);

    const dataString = result.split(/Data\[[0-9]+]:/g)[1];
    if (!dataString) return [];
    const lines = dataString.split(/\n/);

    let currentSize = -1;
    let currentData = '';
    let currentMemory: number | undefined = -1;
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
            const part = line.split('memory=')[1];
            currentMemory = part ? parseInt(part.split(' ')[0]) : undefined;
            return;
        }
        const diff = Math.min(currentSize, 16);
        currentData += line.substring(line.length - diff);
        currentSize -= diff;
    });
    segments.push(new Data(currentMemory, currentData));

    return segments;
}
