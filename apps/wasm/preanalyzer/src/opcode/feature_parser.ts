import feature_opcodes from '../resources/features/feature_opcodes.json';

export function getFeature(opcode: string): string | undefined {
    for (const feature of Object.keys(feature_opcodes)) {
        if (feature_opcodes[feature].indexOf(opcode) !== -1) {
            return feature;
        }
    }
    return undefined;
}
