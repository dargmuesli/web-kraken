import {readFileSync} from "fs";
import {decode} from "@webassemblyjs/wasm-parser/lib/decoder.js";
import {getSectionMetadatas} from "@webassemblyjs/ast/lib/utils.js";
import {traverse} from "@webassemblyjs/ast/lib/traverse.js";


export function ast(path: string) {
    const binary = readFileSync(path);
    const decoderOpts = {
        dump: false
    };

    const ast = decode(binary, decoderOpts);

    console.log(ast.body[0]);

    ast.body[0].fields.filter((field: any) => field.type !== 'Data').forEach((field: any) => console.log(field));


    /*
    get all sections
    ast.body[0].metadata.sections.forEach((section: any) => console.log(section));
     */

    /*
    get imports + import types
    ast.body[0].fields.filter((field: any) => field.type === 'ModuleImport').forEach((field: any) => console.log(field.descr));
     */

    /*
    get types
    ast.body[0].fields.filter((field: any) => field.type === 'TypeInstruction').forEach((field: any) => console.log(field.functype));
     */

    /*
    get producers
    console.log(ast.body[0].metadata.producers[0].producers);
     */




    /*
    traverse(ast, {
       Module(path: any) {
           path.node.metadata
           console.log(path.node.metadata.producers);
       }
    });
    /*
    const sectionMetadata = getSectionMetadatas(ast, 'custom');
    console.log(sectionMetadata);
     */
}