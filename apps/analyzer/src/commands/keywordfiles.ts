import { OptionValues } from 'commander';

import keyword_groups from '../resources/keywords/keyword_groups.json';
import path from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';

export function keywordfiles(output: string, keywords: string[], options: OptionValues) {

    const keywordList: string[] = [];

    for (const keyWordGroup of Object.keys(keyword_groups)) {
        if (keywords.includes(keyWordGroup)) {
            keywordList.push(...keyword_groups[keyWordGroup]);
        }
    }

    const fileList: string[] = [];

    const packages = readdirSync(path.join(process.cwd(), 'packages'));
    packages.forEach((packagePath: string) => {
        const data = JSON.parse(readFileSync(path.join('packages', packagePath)).toString());
        if (!data.keywords) return;
        let found = false;
        for (const keyword of data.keywords) {
            if (keywordList.includes(keyword)) {
                found = true;
                break;
            }
        }
        if ((found && !options.invert) || (!found && options.invert)) {
            fileList.push(...data.files);
        }
    });

    writeFileSync(output, JSON.stringify(fileList, null, 2));
}