import { Octokit } from 'octokit';
import fs, { readdirSync, readFileSync } from 'fs';

export async function packageanalyze(token: string) {
    const octokit = new Octokit({
        auth: token,
        userAgent: 'wasm-analyzer'
    });

    const packages= readdirSync('./packages').filter((file) => file.endsWith('_package.json'));

    for (const pkg of packages) {

        const sourceJson = JSON.parse(readFileSync('./packages/' + pkg).toString());

        const packageLanguages = [];

        // npm readmes and descriptions
        if (sourceJson.readme) addLanguagesFromSource(sourceJson.readme, packageLanguages, 'npm-readme');
        if (sourceJson.description) addLanguagesFromSource(sourceJson.description, packageLanguages, 'npm-description');
        if (sourceJson.repository && sourceJson.repository.type === 'git' && sourceJson.repository.url) await checkGitRepo(octokit, sourceJson, packageLanguages);

        sourceJson['languages'] = packageLanguages;

        fs.writeFileSync('./packages/' + pkg, JSON.stringify(sourceJson, null, 2));
    }
}


function getLanguagesFromString(str: string): string[] {
    const languages = ['Rust', 'AssemblyScript', 'C++'];
    const detectedLanguages = [];
    for (let lang of languages) {
        if (str.toLowerCase().includes(lang.toLowerCase())) {
            detectedLanguages.push(lang);
        }
    }
    return detectedLanguages;
}

function addLanguagesFromSource(source: string, packageLanguages: any[], sourceType: string) {
    for (let lang of getLanguagesFromString(source)) {
        packageLanguages.push({
            source: sourceType,
            language: lang
        });
    }
}

async function checkGitRepo(octokit: Octokit, sourceJson: any, packageLanguages: any[]) {
    //example: git+https://github.com/nakayama0731/my-hello-wasm.git
    const urlData = sourceJson.repository.url.split('github.com/')[1];
    if (!urlData) return;
    const owner = urlData.split('/')[0];
    const repo = urlData.split('/')[1].replace('.git', '');
    try {
        // get metadata of the repository with the given url
        const response = await octokit.request('GET /repos/{owner}/{repo}', {
            owner: owner,
            repo: repo
        });

        const gitDescription = response.data.description;
        if (gitDescription) {
            addLanguagesFromSource(gitDescription, packageLanguages, 'git-description');
            sourceJson['git-description'] = gitDescription;
        }
    } catch (e) {

    }
    try {
        // get languages of the repository with the given url
        const response = await octokit.request('GET /repos/{owner}/{repo}/languages', {
            owner: owner,
            repo: repo
        });

        const languages = response.data;

        if (languages) {
            sourceJson['git-languages'] = languages;
        }
    } catch (e) {

    }
}