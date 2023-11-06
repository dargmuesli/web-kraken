import {getCommandResult} from "../util/util";
import {Section} from "../entity/section";

export async function getCustomSectionList(path: string) {
    const result = await getCommandResult('wasm-objdump', ['-h', path]);
    const sections: Section[] = [];
    for (let string of result
        .split(/\n/)
        .filter((line) => line.trim().startsWith('Custom'))) {
        const name = string.substring(string.indexOf('"') + 1, string.lastIndexOf('"'));
        const raw = await getSectionData(path, name);
        sections.push(new Section(name, raw));
    }
    return sections;
}


async function getSectionData(path: string, name: string) {
    const result = await getCommandResult('wasm-objdump', ['-j', name, path, '-s']);
    const dataLines = result
        .split(/\n/)
        .map((line) => {
            return line.substring(line.length - 16).trim();
        });

    return dataLines.slice(dataLines.indexOf('section Custom:') + 1).join('').trim();
}