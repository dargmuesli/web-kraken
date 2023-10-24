
export class Opcode {
    constructor(
        private readonly name: string,
        private readonly count: number,
        private feature?: string
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