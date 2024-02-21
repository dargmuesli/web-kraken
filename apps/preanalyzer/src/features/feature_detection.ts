
export function feature_detection(details): string[] {
    let features: string[] = details.features

    // feature detection via opcodes
    const differentFeatures = details.opcodes.map((opcode: any) => opcode.feature).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
    features = features.concat(differentFeatures.filter((feature: string) => feature !== 'default'));

    // multi-value feature
    for (const func of details.functions) {
        if (func.returns && func.returns.includes(',')) {
            features.push('multi-value');
            break;
        }
    }

    // JS BigInt to Wasm i64 integration
    for (const func of details.functions) {
        if (func.type === 'INTERNAL') continue;

        if (func.returns.includes('i64') || func.params.includes('i64')) {
            features.push('bigint-to-i64');
            break;
        }
    }

    // multiple memories feature
    for (let segment of details.dataSegments) {
        if (segment.memoryId && segment.memoryId > 0) {
            features.push('multiple-memories');
            break;
        }
    }

    return features;
}
