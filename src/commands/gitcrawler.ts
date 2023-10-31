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
        q: 'language:WebAssembly',
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

        let name = path.basename(item.path).split('.')[0] + '.wat';
        writeFileSync(name, data.toString());

        try {
            let wasmModule = wabtModule.parseWat(name, data.toString());
            let {buffer} = wasmModule.toBinary({});
            fs.unlinkSync(name);
            name = name.replace('.wat', '.wasm');
            let i = 0;
            while (fs.existsSync(name)) {
                name = name.replace('.wasm', `_${i}.wasm`);
                i++;
            }
            writeFileSync(name.replace('.wat', '.wasm'), Buffer.from(buffer));
        } catch (e) {
            // delete the file
            fs.unlinkSync(name);
        }
    }
}


