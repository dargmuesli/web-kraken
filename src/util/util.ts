import {spawn} from "child_process";

export function childSpawn(command: string, options: string[]) {
    let root = __dirname.substring(0, __dirname.lastIndexOf('\\'));
    root = root.substring(0, root.lastIndexOf('\\'));
    return spawn('node', [root + '\\node_modules\\wabt\\bin\\' + command].concat(options));
}