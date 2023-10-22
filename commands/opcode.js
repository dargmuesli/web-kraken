const {getOpcodeMap} = require("../src/opcode/opcode");

async function opcode(path, options) {
    const opcodeMap = await getOpcodeMap(path);
    opcodeMap.forEach((value, key) => {
        if (options.count) {
            console.log(key + ' : ' + value);
        } else {
            console.log(key);
        }
    });
}
module.exports = opcode;