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

    let wabtModule = await wabt();

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
            let {data} = await octokit.rest.repos.getContent({
                mediaType: {
                    format: "raw",
                },
                owner: item.repository.owner.login,
                repo: item.repository.name,
                path: item.path
            });
            let name = path.basename(item.path).split('.')[0] + '.wasm';
            try {
                let number = options.magic ? extractWasmFromJs(data, name, item) : convertWat(wabtModule, name, data, item);
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

function convertWat(wabtModule: any, name: string, data: any, item: any): number {
    let wasmModule = wabtModule.parseWat(name, data.toString());
    let buffer = Buffer.from(wasmModule.toBinary({}))
    if (duplicateExists(buffer)) return 0;
    name = getFileName(name);
    writeFileSync(name, buffer);
    saveSource(item, name, 'wat');
    return 1;
}

function extractWasmFromJs(data: any, name: string, item: any): number {
    let regex = /AGFzbQ[^"'"'"'`]*/g
    let filesSaved = 0;
    data.toString().match(regex)?.forEach((match: string) => {
        let result = Buffer.from(match, 'base64');
        if (duplicateExists(result)) return;
        name = getFileName(name);
        writeFileSync(name, result);
        saveSource(item, name, 'magic');
        filesSaved++;
    });
    return filesSaved;
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


