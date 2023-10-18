const {spawn} = require("child_process");

async function funcls(path) {
    console.log('Function names:');
    const root = __dirname.substring(0, __dirname.lastIndexOf('\\'));


    let types = await getTypeTable(path);
    const child = spawn('node', [root + '\\node_modules\\wabt\\bin\\wasm-objdump', '-x', '-j', 'Function', path]);
    let result = '';
    child.stdout.on('data', (data) => {
        result += data.toString();
    });
    child.stdout.on('end', () => {
        const functionString = result.substring(result.indexOf('- func'));
        const lines = functionString.split(/\n/);
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].indexOf('func') === -1) continue;
            const regExp = /<([^>]+)>/;
            const matches = lines[i].match(regExp);
            if (matches === null) continue;
            const sigIndex = lines[i].indexOf('sig=') + 'sig='.length;
            const index = parseInt(lines[i].substring(sigIndex, sigIndex + 1));
            console.log(matches[1] + ' ' + types[index]);
        }
    });
}

function getTypeTable(path) {
    return new Promise((resolve) => {
        const root = __dirname.substring(0, __dirname.lastIndexOf('\\'));
        const child = spawn('node', [root + '\\node_modules\\wabt\\bin\\wasm-objdump', '-x', '-j', 'Type', path]);
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


module.exports = funcls;