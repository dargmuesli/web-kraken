import PouchDB from 'pouchdb/lib/index.js';
import * as PouchDBFind from "pouchdb-find/lib/index.js";


PouchDB.plugin(PouchDBFind);

import https from "https";
import http from "http";
import stream from "stream";
import fs, {existsSync, mkdirSync, writeFileSync} from "fs";
import gunzip from "gunzip-maybe";
import * as tar from "tar-stream";
import {OptionValues} from "commander";
import {getFileName} from "./gitcrawler";
import path from "path";
import {Presets, SingleBar} from "cli-progress";


export async function npm(db: string, options: OptionValues) {
    console.log('Start crawling npm packages...');
    const dataBase = new PouchDB(db);

    let bookmark = options.bookmark;
    let elements = 0;
    const total = (await dataBase.info()).doc_count;



    const progressBar = new SingleBar({}, Presets.shades_classic);
    progressBar.start(total, 0);


    // Interrupt handling
    if (process.platform === "win32") {
        let rl = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on("SIGINT", function () {
            process.emit("SIGINT");
        });
    }

    process.on('SIGINT', () => {
        progressBar.stop();
        console.log('Crawling aborted.');
        if (bookmark) console.log('Last bookmark: ' + bookmark);
        process.exit();
    });

    while (true) {
        let findResponse: any = await dataBase.find({
            selector: {
                "_id": {"$gte": null},
                "versions": {"$gte": {}}
            },
            bookmark: bookmark
        });
        for (let npmPackage of findResponse.docs) {
            elements++;
            if (!npmPackage.versions || npmPackage.versions.length === 0) continue;
            const versions = npmPackage.versions;
            const latestVersion = versions[Object.keys(versions)[Object.keys(versions).length - 1]];
            const tarLink = latestVersion?.dist?.tarball;

            if (!tarLink) {
                progressBar.update(elements);
                continue;
            }

            const fileNames = await extractWasm(tarLink, npmPackage._id, options.path);
            fileNames.forEach((fileName: string) => saveSource(tarLink, npmPackage._id, fileName, options.path));
            progressBar.update(elements);
        }
        bookmark = findResponse.bookmark;
        if (findResponse.docs.length === 0) break;
    }
    progressBar.update(total);
    progressBar.stop();
    console.log('Finished crawling npm packages.');
}

function extractWasm(tarLink: string, id: string, pathString: string): Promise<string[]> {
    return new Promise<string[]>((resolve: Function) => {
        https.get(tarLink, (response: http.IncomingMessage) => {
            if (response.statusCode === 200) {
                const promises: Promise<void>[] = [];
                const fileNames: string[] = [];

                const tarStream = tar.extract();

                tarStream.on("error", (err: Error) => {
                    console.log(err);
                });

                tarStream.on("entry", (header: { name: string }, entryStream: stream.Readable, next: Function) => {
                    if (header.name.slice((header.name.lastIndexOf(".") - 1 >>> 0) + 2) === 'wasm') {
                        const promise: Promise<void> = saveWasm(entryStream, header.name, pathString);
                        promise.catch(() => {
                        });
                        promises.push(promise);
                    } else {
                        entryStream.resume();
                    }
                    next();
                });

                tarStream.on("finish", () => {
                    Promise.all(promises).then(() => {
                        resolve(fileNames);
                    }, (err) => {
                        console.log(err);
                    });
                });

                const gunzipStream = gunzip();
                gunzipStream.on("error", (err: Error) => {
                    console.log(err);
                });
                response.pipe(gunzipStream).pipe(tarStream);


                function saveWasm(entryStream: stream.Readable, name: string, pathString: string): Promise<void> {
                    return new Promise<void>((resolve_entry: Function) => {
                        const filename: string = getFileName(path.basename(id) + '_' + path.basename(name));
                        fileNames.push(filename);

                        const writeStream: fs.WriteStream = fs.createWriteStream(path.join(pathString, filename));
                        writeStream.on("error", (err: Error) => {
                            entryStream.resume();
                            writeStream.close();
                            console.log(err);
                        });
                        writeStream.on("finish", () => {
                            resolve_entry();
                        });
                        entryStream.pipe(writeStream);
                    });
                }
            } else {
                resolve([]);
            }
        });
    });
}

function saveSource(tarBall: string, name: string, file: string, pathString: string) {
    if (!existsSync(path.join(pathString, 'sources'))) mkdirSync(path.join(pathString, 'sources'));
    const sources = {
        package: name,
        tarball: tarBall,
        type: 'npm'
    };
    const wasmEndIndex = file.lastIndexOf('.wasm');
    file = file.substring(0, wasmEndIndex) + '_sources.json';
    writeFileSync(path.join(pathString, 'sources', file), JSON.stringify(sources, null, 2))
}
