const {childSpawn} = require('../util/util');

function getTypeTable(path) {
    return new Promise((resolve) => {
        const child = childSpawn('wasm-objdump', ['-x', '-j', 'Type', path]);
        let result = '';
        child.stdout.on('data', (data) => {
            result += data.toString();
        });
        const types = [];
        child.stdout.on('end', () => {
            const typeString = result.substring(result.indexOf('- type'));
            const lines = typeString.split(/\n/);
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].indexOf('type') === -1) continue;
                types[i] = lines[i].substring(lines[i].indexOf(']') + 1).trim();
            }
            resolve(types);
        });
    });
}

module.exports = {getTypeTable};