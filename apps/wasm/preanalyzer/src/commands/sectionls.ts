import {getCustomSectionList} from "../section/section_parser";
import {OptionValues} from "commander";
import fs from "fs";

export async function sectionls(file: string, options: OptionValues) {
    if (!fs.existsSync(file)) {
        console.error('File does not exist');
        return;
    }
    const sectionList = await getCustomSectionList(file);
    if (sectionList.length === 0) {
        return;
    }

    if (options.output) {
        let output = options.output;
        if (options.output === true) {
            output = file.replace(/\.[^/.]+$/, "") + '_section.json';
        }
        fs.writeFileSync(output, JSON.stringify(sectionList, null, 2));
        return;
    }

    console.log(sectionList);
}
