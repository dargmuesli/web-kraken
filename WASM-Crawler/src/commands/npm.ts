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


export async function npm(db: string, options: OptionValues) {
    const dataBase = new PouchDB(db);

    let bookmark = options.bookmark;
    let elements = 0;
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
            if (elements % 100 === 0) {
                console.log(elements);
            }
            const versions = npmPackage.versions;
            const latestVersion = versions[Object.keys(versions)[Object.keys(versions).length - 1]];
            const tarLink = latestVersion?.dist?.tarball;

            if (!tarLink) {
                continue;
            }

            const fileNames = await extractWasm(tarLink, npmPackage._id);
            fileNames.forEach((fileName: string) => saveSource(tarLink, npmPackage._id, fileName));
        }
        bookmark = findResponse.bookmark;
        console.log(bookmark);
    }
}

function extractWasm(tarLink: string, id: string): Promise<string[]> {
    return new Promise<string[]>((resolve: Function, reject: Function) => {
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
                        console.log('----------------found wasm----------------');
                        const promise: Promise<void> = saveWasm(entryStream);
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


                function saveWasm(entryStream: stream.Readable): Promise<void> {
                    return new Promise<void>((resolve_entry: Function) => {
                        const filename: string = getFileName(path.basename(id) + '.wasm');
                        fileNames.push(filename);

                        const writeStream: fs.WriteStream = fs.createWriteStream(filename);
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
                console.log('response: ' + response.statusCode);
            }
        });
    });
}

function saveSource(tarBall: string, name: string, file: string) {
    if (!existsSync('./sources')) mkdirSync('./sources');
    const sources = {
        package: name,
        tarball: tarBall,
        type: 'npm'
    };
    writeFileSync(path.join('sources', file.replace('.wasm', '_sources.json')), JSON.stringify(sources, null, 2))
}