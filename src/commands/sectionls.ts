import {getCustomSectionList} from "../section/section_parser";
import {OptionValues} from "commander";
import fs from "fs";

export async function sectionls(path: string, options: OptionValues) {
    const sectionList = await getCustomSectionList(path);
    if (sectionList.length === 0) {
        return;
    }

    const details = sectionList.map((section) => {
        return {
            name: section.getName(),
            raw: section.getRaw()
        };
    });


    if (options.output) {
        let output = options.output;
        if (options.output === true) {
            output = path.replace(/\.[^/.]+$/, "") + '_section.json';
        }
        fs.writeFileSync(output, JSON.stringify(details, null, 2));
        return;
    }

    console.table(details);
}