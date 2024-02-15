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

    const wabtModule = await wabt();

    let page = 1;
    let numberOfFiles = options.number ? options.number : 1000;

    while (numberOfFiles > 0 || options.all) {
        const searchResult = await octokit.rest.search.code({
            q: options.magic ? 'AGFzbQ language:JavaScript ' : 'language:WebAssembly',
            per_page: 100,
            page: page
        });
        page++;

        if (searchResult.data.items.length === 0) break;

        for (const item of searchResult.data.items) {
            const {data} = await octokit.rest.repos.getContent({
                mediaType: {
                    format: "raw",
                },
                owner: item.repository.owner.login,
                repo: item.repository.name,
                path: item.path
            });
            const name = path.basename(item.path).split('.')[0] + '.wasm';
            try {
                const number = options.magic ? extractWasmFromJs(data, name, item) : convertWat(wabtModule, name, data, item);
                numberOfFiles -= number;
            } catch (e) {
                continue;
            }
            //saveSource(item, name, options.magic ? 'magic' : 'wat');
            if (numberOfFiles <= 0 && !options.all) break;
        }
        if (numberOfFiles <= 0 && !options.all) break;
    }
    console.log('Crawling github repositories for wasm files finished!');
}

function convertWat(wabtModule, name: string, data, item): number {
    const wasmModule = wabtModule.parseWat(name, data.toString());
    const buffer = Buffer.from(wasmModule.toBinary({}))
    if (duplicateExists(buffer)) return 0;
    name = getFileName(name);
    writeFileSync(name, buffer);
    saveSource(item, name, 'wat');
    return 1;
}

function extractWasmFromJs(data, name: string, item): number {
    const regex = /AGFzbQ[^"'"'"'`]*/g
    let filesSaved = 0;
    data.toString().match(regex)?.forEach((match: string) => {
        const result = Buffer.from(match, 'base64');
        if (duplicateExists(result)) return;
        name = getFileName(name);
        writeFileSync(name, result);
        saveSource(item, name, 'magic');
        filesSaved++;
    });
    return filesSaved;
}

export function getFileName(name: string): string {
    if (!fs.existsSync(name)) return name;
    const regex = /[(]\d+[)].wasm/g;
    const match = name.match(regex);
    if (!match) return getFileName(name.replace('.wasm', '(2).wasm'));
    const number = parseInt(match[0].replace('(', '').replace(').wasm', ''));
    return getFileName(name.replace(regex, `(${number + 1}).wasm`));
}

function duplicateExists(result: Buffer): boolean {
    const files = fs.readdirSync(process.cwd());
    for (const file of files) {
        if (fs.statSync(file).isDirectory()) continue;
        if (path.extname(file) !== '.wasm') continue;
        if (fs.readFileSync(file).equals(result)) return true;
    }
    return false;
}

function saveSource(item, name: string, type: string) {
    if (!existsSync('./sources')) mkdirSync('./sources');
    const sources = {
        repository: item.repository.html_url,
        path: item.path,
        type: type
    };
    writeFileSync(path.join('sources', name.replace('.wasm', '_sources.json')), JSON.stringify(sources, null, 2))
}


