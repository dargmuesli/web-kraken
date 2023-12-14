import {spawn} from "child_process";
import path from 'path';

function childSpawn(command: string, options: string[]) {
  const wabtBinaryPath = path.join(__dirname, '../../../../../../../node_modules/wabt/bin/', command);
  return spawn('node', [wabtBinaryPath].concat(options));
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
