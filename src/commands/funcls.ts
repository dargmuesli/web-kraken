import {getTypeTable} from "../type/type_util";
import {getFunctionList} from "../function/function_util";
import {Function} from "../entity/function";

export async function funcls(path: string, options: any) {
    const functionList = await getFunctionList(path);
    const types = options.type ? await getTypeTable(path) : null;

    const functionDetails = functionList.map((func: Function) => {
        if (types) {
            const type = types[func.getTypeIndex()];
            const split = type.split('->');
            return {
                name: func.getName(),
                params: split[0].trim(),
                returns: split[1].trim()
            };
        }
        return {name: func.getName()};
    });
    console.table(functionDetails);
}