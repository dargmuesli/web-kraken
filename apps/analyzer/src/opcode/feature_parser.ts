import feature_opcodes from '../resources/features/feature_opcodes.json';

export function getFeatureMap(): Map<string, string[]> {
    const featureMap = new Map<string, string[]>();
    for (const feature of Object.keys(feature_opcodes)) {
        featureMap.set(feature, feature_opcodes[feature]);
    }
    return featureMap;
}

export function getFeature(opcode: string, featureMap: Map<string, string[]>): string | undefined {
    for (const [feature, opcodes] of featureMap) {
        if (opcodes.indexOf(opcode) !== -1) {
            return feature;
        }
    }
    return undefined;
}
