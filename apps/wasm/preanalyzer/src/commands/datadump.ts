import { OptionValues } from 'commander';
import fs from 'fs';
import { getDataSections } from '../data/data_parser';


export async function datadump(file: string, options: OptionValues): Promise<void>{
    if (!fs.existsSync(file)) {
        console.error('File does not exist');
        return;
    }
    const segments = await getDataSections(file);
    if (segments.length === 0) {
        return;
    }

    if (options.output) {
        let output = options.output;
        if (options.output === true) {
            output = file.replace(/\.[^/.]+$/, "") + '_dataSegments.json';
        }
        fs.writeFileSync(output, JSON.stringify(segments, null, 2));
        return;
    }
    console.log(segments);
}
