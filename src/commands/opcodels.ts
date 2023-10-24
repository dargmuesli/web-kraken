import {getOpcodeList} from "../opcode/opcode_util";
import {OptionValues} from "commander";
import {Opcode} from "../entity/opcode";
import fs from "fs";

export async function opcodels(path: string, options: OptionValues) {
    const opcodeList = await getOpcodeList(path);

    const opcodeDetails = opcodeList.map((opcode: Opcode) => {
        if (options.count) {
            return {
                name: opcode.getName(),
                count: opcode.getCount()
            };
        }
        return {name: opcode.getName()};
    });

    if (options.output) {
        fs.writeFileSync(options.output, JSON.stringify(opcodeDetails, null, 2));
        return;
    }

    console.table(opcodeDetails);
}