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
        const rl = require("readline").createInterface({
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
        const findResponse = await dataBase.find({
            selector: {
                "_id": {"$gte": null},
                "versions": {"$gte": {}}
            },
            bookmark: bookmark
        });
        for (const npmPackage of findResponse.docs) {
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
            if (fileNames.length === 0) {
                progressBar.update(elements);
                continue;
            }

            savePackage(npmPackage, fileNames, options.path, tarLink);
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

function savePackage(npmPackage, fileNames: string[], pathString: string, tarBall: string) {
    const packageData = {
        package: npmPackage._id,
        tarball: tarBall,
        type: 'npm',
        files: fileNames,
        description: npmPackage.description,
        readme: npmPackage.readme,
        keywords: npmPackage.keywords
    };

    if (!existsSync(path.join(pathString, 'packages'))) mkdirSync(path.join(pathString, 'packages'));

    fs.writeFileSync(path.join('./packages', npmPackage._id.replace('@', '').replace('/', '_') + '_package.json'), JSON.stringify(packageData, null, 2));
}
