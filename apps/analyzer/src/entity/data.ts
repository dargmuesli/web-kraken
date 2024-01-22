
export class Data {
    constructor(
        private readonly memoryId: number,
        private readonly raw: string
    ) {}

    public getMemoryId(): number {
        return this.memoryId;
    }

    public getRaw(): string {
        return this.raw;
    }
}