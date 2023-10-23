import {getOpcodeList} from "../opcode/opcode_util";
import {OptionValues} from "commander";

export async function opcodels(path: string, options: OptionValues) {
    let opcodeList = await getOpcodeList(path);
    opcodeList.forEach((opcode) => {
        if (options.count) {
            console.log(opcode.getName() + ' ' + opcode.getCount());
            return;
        }
        console.log(opcode.getName());
    });
}