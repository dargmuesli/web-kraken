const {spawn} = require('child_process');

function childSpawn(command, options) {
    let root = __dirname.substring(0, __dirname.lastIndexOf('\\'));
    root = root.substring(0, root.lastIndexOf('\\'));
    return spawn('node', [root + '\\node_modules\\wabt\\bin\\' + command].concat(options));
}

module.exports = {childSpawn};