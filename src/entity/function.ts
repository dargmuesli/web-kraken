
export class Function {
    constructor(
        private readonly name: string,
        private readonly typeIndex: number
    ) {}

    public getName(): string {
        return this.name;
    }

    public getTypeIndex(): number {
        return this.typeIndex;
    }
}