const {spawn} = require("child_process");

function funcls (path) {
    console.log('Function names:');

    const child = spawn('node', ['./node_modules/wabt/bin/wasm-objdump', '-x' , '-j', 'Function', path]);
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
}
module.exports = funcls;