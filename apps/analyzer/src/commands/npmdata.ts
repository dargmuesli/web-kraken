import PouchDB from 'pouchdb';
import fs, { readFileSync } from 'fs';
import {OptionValues} from "commander";

export async function npmdata(source: string, options: OptionValues, db?: PouchDB.Database<{}>) {
    const dataBase = options.db ? db : new PouchDB('https://skimdb.npmjs.com/registry');
    const sourceJson = JSON.parse(readFileSync(source).toString())
    if (!sourceJson.package) return;

    while(true) {
        try {
            let response = await dataBase.get(sourceJson.package);
            if (!response) return;
            let keywords = response['keywords'];
            if (keywords && keywords.length > 0) {
                keywords = [...new Set(keywords.map((keyword: string) => keyword.toLowerCase()))];
            }

            sourceJson['keywords'] = keywords;
            if (response['readme'] !== 'ERROR: No README data found!') {
                sourceJson['readme'] = response['readme'];
            }
            sourceJson['description'] = response['description'];

            fs.writeFileSync(source, JSON.stringify(sourceJson, null, 2));
            return;
        } catch (e) {

        }
    }
}