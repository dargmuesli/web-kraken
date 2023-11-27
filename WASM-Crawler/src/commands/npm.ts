import PouchDB from 'pouchdb/lib/index.js';
import * as PouchDBFind from "pouchdb-find/lib/index.js";

PouchDB.plugin(PouchDBFind);

import https from "https";
import http from "http";
import stream from "stream";
import fs from "fs";
import gunzip from "gunzip-maybe";
import * as tar from "tar-stream";


export async function npm(db: string) {
    // http://127.0.0.1:5984/npm
    const dataBase = new PouchDB(db);

    let bookmark;
    let elements = 0;
    while (true) {
        let findResponse: any = await dataBase.find({
            selector: {
                "_id": {"$gte": null},
                "versions": {"$gte": {}}
            },
            bookmark: bookmark
        });
        bookmark = findResponse.bookmark;
        console.log(bookmark);

        for (let npmPackage of findResponse.docs) {
            elements++;
            if (elements % 100 === 0) {
                console.log(elements);
            }
            const versions = npmPackage.versions;
            const latestVersion = versions[Object.keys(versions)[Object.keys(versions).length - 1]];
            const tarLink = latestVersion?.dist?.tarball;

            tarLink ? await extractWasm(tarLink):"";
        }
    }
}

function extractWasm(tarLink: string): Promise<void> {
    return new Promise<void>((resolve: Function, reject: Function) => {
        https.get(tarLink, (response: http.IncomingMessage) => {
            if (response.statusCode === 200) {
                const promises: Promise<void>[] = [];

                const tarStream = tar.extract();

                tarStream.on("error", (err: Error) => {
                    console.log(err);
                });

                tarStream.on("entry", (header: { name: string }, entryStream: stream.Readable, next: Function) => {
                    if (header.name.slice((header.name.lastIndexOf(".") - 1 >>> 0) + 2) === 'wasm') {
                        console.log('----------------found wasm----------------');
                        const promise: Promise<void> = saveWasm(entryStream, header.name);
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
                        resolve();
                    }, (err) => {
                        console.log(err);
                    });
                });

                const gunzipStream = gunzip();
                gunzipStream.on("error", (err: Error) => {
                    console.log(err);
                });
                response.pipe(gunzipStream).pipe(tarStream);


                function saveWasm(entryStream: stream.Readable, name: string): Promise<void> {
                    return new Promise<void>((resolve_entry: Function) => {
                        const split: string[] = name.split("/");
                        const filename: string = split[split.length - 1];

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