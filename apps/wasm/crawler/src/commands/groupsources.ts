import fs, { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';

export function groupsources() {
    if (!existsSync('./sources')) return;

    const files = readdirSync('./sources');
    const sources = files.filter((file) => file.endsWith('_sources.json'));
    if (sources.length === 0) return;

    if (!existsSync('./packages')) fs.mkdirSync('./packages');

    const packageMap = new Map<String, any>;
    sources.forEach((source) => {
        const sourceJson = JSON.parse(readFileSync(path.join('sources', source)).toString());
        if (!(sourceJson.type === 'npm')) return;
        const fileName = source.replace('_sources.json', '');
        if (packageMap.has(sourceJson.package)) {
            const packageData = packageMap.get(sourceJson.package);
            if (packageData.files.indexOf(fileName) !== -1) return;
            packageData.files.push(fileName);
            packageMap.set(sourceJson.package, packageData);
            return;
        }
        packageMap.set(sourceJson.package, {
            package: sourceJson.package,
            tarball: sourceJson.tarball,
            type: sourceJson.type,
            files: [fileName]
        });
    });

    packageMap.forEach((value, key) => {
        fs.writeFileSync(path.join('./packages', key.replace('@', '').replace('/', '_') + '_package.json'), JSON.stringify(value, null, 2));
    });
}