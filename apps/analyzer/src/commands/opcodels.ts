import {getOpcodeList} from "../opcode/opcode_parser";
import {OptionValues} from "commander";
import {Opcode} from "../entity/opcode";
import fs from "fs";

export async function opcodels(path: string, options: OptionValues) {
    const opcodeList = await getOpcodeList(path);
    if (opcodeList.length === 0) {
        return;
    }

    const opcodeDetails = opcodeList.map((opcode: Opcode) => {
        let details = {
            name: opcode.getName(),
            count: (options.count ? opcode.getCount() : undefined),
            percentage: (options.count ? opcode.getPercentage() : undefined),
            feature: (options.feature ? opcode.getFeature() : undefined)
        }
        if (!options.count) {
            delete details.count;
            delete details['percentage(%)'];
        }
        if (!options.feature) {
            delete details.feature;
        }
        return details;
    });

    if (options.sort === 'name') {
        opcodeDetails.sort((a: any, b: any) => {
            return a.name.localeCompare(b.name);
        });
    }
    if (options.sort === 'feature' && options.feature) {
        opcodeDetails.sort((a: any, b: any) => {
            return a.feature.localeCompare(b.feature);
        });
    }

    const differentFeatures = opcodeDetails.map((opcode: any) => opcode.feature).filter((value: any, index: any, self: any) => self.indexOf(value) === index);

    const json = {
        features: differentFeatures,
        opcodes: opcodeDetails
    }

    if (options.output) {
        let output = options.output;
        if (options.output === true) {
            output = path.replace(/\.[^/.]+$/, "") + '_opcode.json';
        }
        fs.writeFileSync(output, JSON.stringify(json, null, 2));
        return;
    }

    console.table(opcodeDetails);
}