
export class Function {
    constructor(
        private readonly name: string,
        private readonly typeIndex: number,
        private readonly source?: string
    ) {}

    public getName(): string {
        return this.name;
    }

    public getTypeIndex(): number {
        return this.typeIndex;
    }

    public getSource(): string  | undefined{
        return this.source;
    }
}