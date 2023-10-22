import {spawn} from "child_process";

export const childSpawn = (command, options) => {
    const root = __dirname.substring(0, __dirname.lastIndexOf('\\'));
    return spawn('node', [root + '\\node_modules\\wabt\\bin\\' + command].concat(options));
}