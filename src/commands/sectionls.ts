import {getCustomSectionList} from "../section/section_parser";
import {OptionValues} from "commander";
import fs from "fs";

export async function sectionls(path: string, options: OptionValues) {
    const strings = await getCustomSectionList(path);
    if (strings.length === 0) return;
    if (options.output) {
        let output = options.output;
        if (options.output === true) {
            output = path.replace(/\.[^/.]+$/, "") +'_section.txt';
        }
        fs.writeFileSync(output, strings.join('\n'));
        return;
    }

    console.table(strings.join('\n'));
}