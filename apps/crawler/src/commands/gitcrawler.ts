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

    // packageName -> packageDetails
    const packageMap = new Map<string, any>();

    while (numberOfFiles > 0 || options.all) {
        const searchResult = await octokit.rest.search.code({
            q: options.magic ? 'AGFzbQ language:JavaScript ' : 'language:WebAssembly',
            per_page: 100,
            page: page
        });
        page++;

        if (searchResult.data.items.length === 0) break;

        for (const item of searchResult.data.items) {
            const packageName = item.repository.full_name.replace('/', '_');

            const packageDetails = packageMap.has(packageName) ? packageMap.get(packageName) : {
                package: packageName,
                type: options.magic ? 'magic' : 'wat',
                repository: {
                    type: 'git',
                    url: item.repository.url
                },
                files: []
            }

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
                const number = options.magic ? extractWasmFromJs(data, name, item, packageMap, packageDetails) : convertWat(wabtModule, name, data, item, packageMap, packageDetails);
                numberOfFiles -= number;
            } catch (e) {
                continue;
            }
            if (numberOfFiles <= 0 && !options.all) break;
        }
        if (numberOfFiles <= 0 && !options.all) break;
    }
    savePackages(packageMap);
    console.log('Crawling github repositories for wasm files finished!');
}

function convertWat(wabtModule, name: string, data, item, packageMap, packageDetails): number {
    // enable all features
    const features = {
        exceptions: true,
        mutable_globals: true,
        sat_float_to_int: true,
        sign_extension: true,
        simd: true,
        threads: true,
        function_references: true,
        multi_value: true,
        tail_call: true,
        bulk_memory: true,
        reference_types: true,
        annotations: true,
        code_metadata: true,
        gc: true,
        memory64: true,
        extended_const: true,
        relaxed_simd: true
    }
    const wasmModule = wabtModule.parseWat(name, data.toString(), features);
    const buffer = Buffer.from(wasmModule.toBinary({}).buffer);
    if (duplicateExists(buffer)) return 0;
    name = getFileName(packageDetails.package + '_' + name);
    writeFileSync(name, buffer);
    packageDetails.files.push(name.replace('.wasm', ''));
    packageMap.set(packageDetails.package, packageDetails);
    return 1;
}

function extractWasmFromJs(data, name: string, item, packageMap, packageDetails): number {
    const regex = /AGFzbQ[^"'"'"'`]*/g
    let filesSaved = 0;
    data.toString().match(regex)?.forEach((match: string) => {
        const result = Buffer.from(match, 'base64');
        if (duplicateExists(result)) return;
        name = getFileName(packageDetails.package + '_' + name);
        writeFileSync(name, result);
        packageDetails.files.push(name.replace('.wasm', ''));
        filesSaved++;
    });
    if (filesSaved > 0) packageMap.set(packageDetails.package, packageDetails);
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

function savePackages(packageMap: Map<string, any>) {
    if (!existsSync('./packages')) mkdirSync('./packages');
    packageMap.forEach((value, key) => {
        writeFileSync(path.join('packages', key + '_package.json'), JSON.stringify(value, null, 2));
    });
}



