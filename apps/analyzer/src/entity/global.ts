export class Global {
    constructor(
        private readonly name: string,
        private readonly type?: string,
        private readonly source?: string,
        private readonly mutable?: boolean
    ) {}

    public getName(): string {
        return this.name;
    }

    public getSource(): string  | undefined{
        return this.source;
    }

    public getMutable(): boolean | undefined {
        return this.mutable;
    }

    public getType(): string | undefined {
        return this.type;
    }
}