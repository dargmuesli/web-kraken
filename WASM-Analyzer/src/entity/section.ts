export class Section {
    constructor(
        private readonly name: string,
        private readonly raw: string
    ) {
    }
}


export class ProducersSection extends Section {
    constructor(
        name: string,
        raw: string,
        private readonly language?: string | undefined,
        private readonly processed_by?: string[] | undefined,
        private readonly sdk?: string | undefined
    ) {
        super(name, raw);

        const strings = raw.split('..');
        this.splitArrayOn(strings, 'language');
        this.splitArrayOn(strings, 'processed-by');
        this.splitArrayOn(strings, 'sdk');
        const results = strings.filter((str) => str !== '');

        const languageIndex = results.findIndex((str) => str.includes('language')) + 1;
        const processed_byIndex = results.findIndex((str) => str.includes('processed-by')) + 1;
        const sdkIndex = results.findIndex((str) => str.includes('sdk')) + 1;

        this.language = languageIndex ? results[languageIndex] : undefined;
        this.processed_by = processed_byIndex ? this.getProcessedBy(results[processed_byIndex]) : undefined;
        this.sdk = sdkIndex ? results[sdkIndex] : undefined;
    }

    splitArrayOn(array: string[], field: string): void {
        const index = array.findIndex((str) => str.includes(field));
        if (index !== -1) {
            const parts = array[index].split(field);
            array.splice(index, 1, parts[0], field, parts[1]);
        }
    }

    getProcessedBy(raw: string): string[] {
        const regex = /([\d)][.][A-Za-z])/g;
        const matches = raw.match(regex);

        if (!matches) return [raw];

        let result = raw;

        for (let match of matches) {
            // $ to signal break between each processed-by part
            result = result.replace(match, match.replace('.', '$'));
        }

        return result.split('$');
    }
}