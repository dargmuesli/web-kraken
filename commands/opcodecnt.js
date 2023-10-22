const {childSpawn} = require("../src/util");

function opcodecnt (path) {
    const child = childSpawn('wasm-opcodecnt', [path, '--enable-all']);
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