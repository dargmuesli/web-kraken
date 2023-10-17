
const { spawn } = require('child_process');

function execute(parameters) {
    const child = spawn('node', parameters);
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



//execute(['./node_modules/wabt/bin/wasm-opcodecnt', 'tiktoken_bg.wasm']);
execute(['./node_modules/wabt/bin/wasm-objdump', '-x' , '-j', 'Function', 'tiktoken_bg.wasm']);

