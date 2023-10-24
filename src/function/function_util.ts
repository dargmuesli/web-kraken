import {childSpawn} from "../util/util";
import {Function} from "../entity/function";

export function getFunctionList(path: string): Promise<Function[]> {
    return new Promise((resolve) => {
        const child = childSpawn('wasm-objdump', ['-x', '-j', 'Function', path]);
        let result = '';
        child.stdout.on('data', (data) => {
            result += data.toString();
        });
        child.stdout.on('end', async () => {
            const functionString = result.substring(result.indexOf('- func'));
            const lines = functionString.split(/\n/);
            const functionList: Function[] = [];

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].indexOf('func') === -1) continue;

                const regExp = /<([^>]+)>/;
                const matches = lines[i].match(regExp);
                if (!matches) continue;
                let name = matches[1];

                const sigIndex = lines[i].indexOf('sig=') + 'sig='.length;
                const typeIndex = parseInt(lines[i].substring(sigIndex, sigIndex + 1));

                functionList.push(new Function(name, typeIndex));
            }
            resolve(functionList);
        });
    });
}