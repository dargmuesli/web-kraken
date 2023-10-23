
export class Opcode {
    constructor(
        public readonly name: string,
        public readonly count: number,
        public feature?: string
    ) {}

    public getName(): string {
        return this.name;
    }

    public getCount(): number {
        return this.count;
    }

    public getFeature(): string | undefined {
        return this.feature;
    }
}