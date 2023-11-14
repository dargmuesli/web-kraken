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
}

async function convertWat(wabtModule: any, name: string, data: any) {
    try {
        let wasmModule = wabtModule.parseWat(name, data.toString());
        let {buffer} = wasmModule.toBinary({});
        let i = 0;
        while (fs.existsSync(name)) {
            name = name.replace('.wasm', `_${i}.wasm`);
            i++;
        }
        writeFileSync(name, Buffer.from(buffer));
    } catch (e) {
        //
    }
}


function extractWasmFromJs(data: any, name: string) {
    let regex = /AGFzbQ[^"'"'"'`]*/g
    data.toString().match(regex)?.forEach((match: string) => {
        let result = Buffer.from(match, 'base64');
        let i = 0;
        while (fs.existsSync(name)) {
            name = name.replace('.wasm', `_${i}.wasm`);
            i++;
        }
        writeFileSync(name, result);
    });
}


