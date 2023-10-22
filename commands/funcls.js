const {childSpawn} = require("../src/util/util");
const {getTypeTable} = require("../src/type/type");

function funcls(path, options) {
    const child = childSpawn('wasm-objdump', ['-x', '-j', 'Function', path]);
    let result = '';
    child.stdout.on('data', (data) => {
        result += data.toString();
    });
    child.stdout.on('end', async () => {
        const functionString = result.substring(result.indexOf('- func'));
        const lines = functionString.split(/\n/);
        const types = options.type ? await getTypeTable(path) : [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].indexOf('func') === -1) continue;

            const regExp = /<([^>]+)>/;
            const matches = lines[i].match(regExp);
            if (matches === null) continue;
            let output = matches[1];

            if (options.type) {
                const sigIndex = lines[i].indexOf('sig=') + 'sig='.length;
                const index = parseInt(lines[i].substring(sigIndex, sigIndex + 1));
                output += ' ' + types[index];
            }
            console.log(output);
        }
    });
}


module.exports = funcls;