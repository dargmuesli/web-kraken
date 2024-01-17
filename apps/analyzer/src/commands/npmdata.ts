import PouchDB from 'pouchdb';
import fs, { readFileSync } from 'fs';
import {OptionValues} from "commander";

export async function npmdata(source: string, options: OptionValues, db?: PouchDB.Database<{}>) {
    const dataBase = options.db ? db : new PouchDB('https://skimdb.npmjs.com/registry');
    const sourceJson = JSON.parse(readFileSync(source).toString())
    if (!sourceJson.package) return;

    let response = await dataBase.get(sourceJson.package);
    if (!response) return;
    sourceJson['keywords'] = response['keywords'];
    sourceJson['readme'] = response['readme'];
    sourceJson['description'] = response['description'];

    fs.writeFileSync(source, JSON.stringify(sourceJson, null, 2));
}