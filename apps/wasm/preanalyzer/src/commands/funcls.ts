import { getFunctionList } from '../function/function_parser';
import fs from 'fs';

export async function funcls(file: string, options: any) {
    if (!fs.existsSync(file)) {
        console.error('File does not exist');
        return;
    }

    const functionList = await getFunctionList(file);

    if (options.sort === 'name') {
        functionList.sort((a, b) => {
            return a.getName().localeCompare(b.getName());
        });
    } else {
        functionList.sort((a, b) => {
            return a.getType().localeCompare(b.getType());
        });
    }

    if (options.output) {
        let output = options.output;
        if (options.output === true) {
            output = file.replace(/\.[^/.]+$/, '') + '_function' + '.json';
        }
        fs.writeFileSync(output, JSON.stringify(functionList, null, 2));
        return;
    }
    console.log(functionList);
}
