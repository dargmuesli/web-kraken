
export class Opcode {
    constructor(
        private readonly name: string,
        private readonly count: number,
        private readonly percentage: string,
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

    public getPercentage(): string {
        return this.percentage;
    }
}