const {spawn} = require("child_process");

function opcodecnt (path) {

    const root = __dirname.substring(0, __dirname.lastIndexOf('\\'));
    const child = spawn('node', [root + '\\node_modules\\wabt\\bin\\wasm-opcodecnt', path, '--enable-all']);
    let result = '';
    child.stdout.on('data', (data) => {
        result += data.toString();
    });
    child.stdout.on('end', () => {
        let strings = result.split(/\n\s*\n/);
        console.log(strings[0]+ '\n' + strings[1]);
    });
}
module.exports = opcodecnt;