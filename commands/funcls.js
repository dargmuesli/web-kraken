const {spawn} = require("child_process");

function funcls (path) {
    console.log('Function names:');
    console.log(__dirname);

    const root = __dirname.substring(0, __dirname.lastIndexOf('\\'));
    const child = spawn('node', [root + '\\node_modules\\wabt\\bin\\wasm-objdump', '-x' , '-j', 'Function', path]);
    child.stdout.on('data', (data) => {
        const regExp = /<([^>]+)>/g;
        const matches = data.toString().matchAll(regExp);
        if (matches === null) {
            return;
        }
        for (const match of matches) {
            console.log(match[1]);
        }
    });

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
}
module.exports = funcls;