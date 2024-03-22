import PouchDB from 'pouchdb';
import fs, { readdirSync, readFileSync } from 'fs';

export async function npmdata() {
    const dataBase = new PouchDB('https://skimdb.npmjs.com/registry');
    const packages= readdirSync('./packages').filter((file) => file.endsWith('_package.json'));
    //const packages = ['blakegearin_actual-app-web_package.json'];

    for (const pkg of packages) {
        const sourceJson = JSON.parse(readFileSync('./packages/' + pkg).toString());
        console.log(pkg);

        while(true) {
            try {
                let response = await dataBase.get(sourceJson.package);
                if (!response) break;
                sourceJson['description'] = response['description'];
                sourceJson['readme'] = response['readme'];
                sourceJson['keywords'] = response['keywords'];
                sourceJson['repository'] = response['repository'];
                fs.writeFileSync('./packages/' + pkg, JSON.stringify(sourceJson, null, 2));
                break;
            } catch (e) {
                if (e.status === 404) break;
                //wait 1 second before next request
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        //wait 1 second before next request if not the last package
        if (pkg !== packages[packages.length - 1]) await new Promise(resolve => setTimeout(resolve, 1000));
    }
}