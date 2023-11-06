export class Section {
    constructor(
        private readonly name: string,
        private readonly raw: string
    ) {}
    public getName(): string {
        return this.name;
    }
    public getRaw(): string {
        return this.raw;
    }
}

/*

export class Producers extends Section{
    constructor(
        private readonly language?: string[] | undefined,
        private readonly processed_by?: string[] | undefined,
        private readonly sdk?: string[] | undefined
    ) {
        super(name, raw);
    }
}

 */