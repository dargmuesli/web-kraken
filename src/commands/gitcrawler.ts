import {Octokit} from "octokit";
import fs, {writeFileSync} from "fs";
import path from "path";
import wabt from "wabt";
import {OptionValues} from "commander";

export async function gitcrawler(token: string, options: OptionValues) {
    const octokit = new Octokit({
        auth: token,
        userAgent: 'wasm-analyzer'
    });
    console.log('Crawling github repositories for wasm files...');

    // 'wasm in:file language:wasm'

    const searchResult = await octokit.rest.search.code({
        q: options.magic ? 'AGFzbQ language:JavaScript ' : 'language:WebAssembly',
        per_page: options.number ? options.number : 100,
        page: options.page ? options.page : 1
    });

    let wabtModule = await wabt();

    for (const item of searchResult.data.items) {
        let {data} = await octokit.rest.repos.getContent({
            mediaType: {
                format: "raw",
            },
            owner: item.repository.owner.login,
            repo: item.repository.name,
            path: item.path
        });
        let name = path.basename(item.path).split('.')[0] + '.wasm';
        options.magic ? extractWasmFromJs(data, name) : await convertWat(wabtModule, name, data);
    }
    console.log('Crawling github repositories for wasm files finished!');
}

async function convertWat(wabtModule: any, name: string, data: any) {
    try {
        let wasmModule = wabtModule.parseWat(name, data.toString());
        let buffer = Buffer.from(wasmModule.toBinary({}))
        if (duplicateExists(buffer)) return;
        name = getFileName(name);
        writeFileSync(name, buffer);
    } catch (e) {
        //
    }
}

function extractWasmFromJs(data: any, name: string) {
    let regex = /AGFzbQ[^"'"'"'`]*/g
    data.toString().match(regex)?.forEach((match: string) => {
        let result = Buffer.from(match, 'base64');
        if (duplicateExists(result)) return;
        name = getFileName(name);
        writeFileSync(name, result);
    });
}

function getFileName(name: string): string {
    if (!fs.existsSync(name)) return name;
    let regex = /[(]\d+[)].wasm/g;
    let match = name.match(regex);
    if (!match) return getFileName(name.replace('.wasm', '(2).wasm'));
    let number = parseInt(match[0].replace('(', '').replace(').wasm', ''));
    return getFileName(name.replace(regex, `(${number + 1}).wasm`));
}

function duplicateExists(result: Buffer): boolean {
    let files = fs.readdirSync(process.cwd());
    for (const file of files) {
        if (fs.statSync(file).isDirectory()) continue;
        if (path.extname(file) !== '.wasm') continue;
        if (fs.readFileSync(file).equals(result)) return true;
    }
    return false;
}


