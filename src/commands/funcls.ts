import {getTypeTable} from "../type/type_parser";
import {getFunctionList, getImportList} from "../function/function_parser";
import {Function} from "../entity/function";
import * as fs from "fs";

export async function funcls(path: string, options: any) {
    const functionDetails = await getDetails(options, path);

    if (options.sort === 'name') {
        functionDetails.sort((a: any, b: any) => {
            return a.name.localeCompare(b.name);
        });
    }
    if (options.sort === 'source' && options.import) {
        functionDetails.sort((a: any, b: any) => {
            return a.source.localeCompare(b.source);
        });
    }

    if (options.output) {
        let output = options.output;
        if (options.output === true) {
            output = path.replace(/\.[^/.]+$/, "") + (options.import ? '_import' : '_function') + '.json';
        }
        fs.writeFileSync(output, JSON.stringify(functionDetails, null, 2));
        return;
    }
    console.table(functionDetails);
}

async function getDetails(options: any, path: string) {
    const functionList = options.import ? await getImportList(path) : await getFunctionList(path);
    const types = options.type ? await getTypeTable(path) : null;

    return functionList.map((func: Function) => {
        const type = types ? types[func.getTypeIndex()] : null;
        const split = type ? type.split('->') : null;
        let details = {
            name: func.getName(),
            source: func.getSource(),
            params: (split ? split[0].trim() : undefined),
            returns: (split ? split[1].trim() : undefined)
        }
        if (!options.type) {
            delete details.params;
            delete details.returns;
        }
        if (!options.import) {
            delete details.source;
        }
        return details;
    });
}