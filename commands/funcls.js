const {spawn} = require("child_process");

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

function childSpawn(command, options) {
    const root = __dirname.substring(0, __dirname.lastIndexOf('\\'));
    return spawn('node', [root + '\\node_modules\\wabt\\bin\\' + command].concat(options));
}


module.exports = funcls;