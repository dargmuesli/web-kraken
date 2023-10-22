const {childSpawn} = require('../util/util');

function getOpcodeMap(path) {
    return new Promise((resolve) => {
        const child = childSpawn('wasm-opcodecnt', [path, '--enable-all']);
        let result = '';
        child.stdout.on('data', (data) => {
            result += data.toString();
        });
        const opcodeMap = new Map();
        child.stdout.on('end', () => {
            let strings = result.split(/\n\s*\n/);  // strings[0] == total, strings[1] == opcodes
            let lines = strings[1].split(/\n/);
            for (let i = 1; i < lines.length; i++) {
                let parts = lines[i].split(/:/);
                let opcode = parts[0].trim();
                let count = parseInt(parts[1].trim());
                opcodeMap.set(opcode, count);
            }
            resolve(opcodeMap);
        });
    });
}

module.exports = {getOpcodeMap};