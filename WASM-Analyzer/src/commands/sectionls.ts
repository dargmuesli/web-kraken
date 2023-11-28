import {getCustomSectionList} from "../section/section_parser";
import {OptionValues} from "commander";
import fs from "fs";

export async function sectionls(path: string, options: OptionValues) {
    const sectionList = await getCustomSectionList(path);
    if (sectionList.length === 0) {
        return;
    }

    if (options.output) {
        let output = options.output;
        if (options.output === true) {
            output = path.replace(/\.[^/.]+$/, "") + '_section.json';
        }
        fs.writeFileSync(output, JSON.stringify(sectionList, null, 2));
        return;
    }

    console.table(sectionList, ['name', 'raw']);
}