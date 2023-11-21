import {Octokit} from "octokit";
import fs, {existsSync, mkdirSync, writeFileSync} from "fs";
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
        let name = getFileName(path.basename(item.path).split('.')[0] + '.wasm');
        try {
            options.magic ? extractWasmFromJs(data, name) : await convertWat(wabtModule, name, data);
        } catch (e) {
            continue;
        }
        saveSource(item, name, options.magic ? 'magic' : 'wat');
    }
    console.log('Crawling github repositories for wasm files finished!');
}

async function convertWat(wabtModule: any, name: string, data: any) {
    let wasmModule = wabtModule.parseWat(name, data.toString());
    let buffer = Buffer.from(wasmModule.toBinary({}))
    if (duplicateExists(buffer)) return;
    writeFileSync(name, buffer);
}

function extractWasmFromJs(data: any, name: string) {
    let regex = /AGFzbQ[^"'"'"'`]*/g
    data.toString().match(regex)?.forEach((match: string) => {
        let result = Buffer.from(match, 'base64');
        if (duplicateExists(result)) return;
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

function saveSource(item: any, name: string, type: string) {
    if (!existsSync('./sources')) mkdirSync('./sources');
    const sources = {
        repository: item.repository.html_url,
        path: item.path,
        type: type
    };
    writeFileSync(path.join('sources', name.replace('.wasm', '_sources.json')), JSON.stringify(sources, null, 2))
}


