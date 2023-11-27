import PouchDB from 'pouchdb/lib/index.js';
import https from "https";
import http from "http";
import stream from "stream";
import fs from "fs";
import gunzip from "gunzip-maybe";
import * as tar from "tar-stream";


export async function npm() {
    const db = new PouchDB('http://127.0.0.1:5984/npm');
    /*
    const findResponse = await db.find({
        selector: {
            _id: '--can-you-install'
        }
    });

     */
    //console.log(findResponse);
}

function extractWasm(tarLink: string): Promise <void> {
    return new Promise<void>((resolve: Function, reject: Function) => {
        https.get(tarLink, (response: http.IncomingMessage) => {
            if (response.statusCode === 200) {
                const promises: Promise<void>[] = [];

                const tarStream = tar.extract();

                tarStream.on("error", (err: Error) => {
                    console.log(err);
                });

                tarStream.on("entry", (header: { name: string }, entryStream: stream.Readable, next: Function) => {
                    console.log(header.name);
                    if (header.name.slice((header.name.lastIndexOf(".") - 1 >>> 0) + 2) === 'wasm') {
                        const promise: Promise<void> = saveWasm(entryStream, header.name);
                        promise.catch(() => {});
                        promises.push(promise);
                    } else {
                        entryStream.resume();
                    }
                    next();
                });

                tarStream.on("finish", () => {
                    console.log('Finished checking tarball, saving wasm files');
                    Promise.all(promises).then(() => {
                        console.log('Finished saving wasm files');
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