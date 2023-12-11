import {spawn} from "child_process";

function childSpawn(command: string, options: string[]) {
    let root = __dirname.substring(0, __dirname.lastIndexOf('\\'));
    root = root.substring(0, root.lastIndexOf('\\'));
    return spawn('node', [root + '\\node_modules\\wabt\\bin\\' + command].concat(options));
}

export function getCommandResult(command: string, options: string[]): Promise<string> {
    return new Promise((resolve) => {
        const child = childSpawn(command, options);
        let result = '';
        child.stdout.on('data', (data) => {
            result += data.toString();
        });
        child.stdout.on('end', () => {
           resolve(result);
        });
    });
}