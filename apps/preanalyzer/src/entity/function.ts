import { functionType } from './function_type';

export class Function {
    constructor(
        private readonly name: string,
        private readonly params: string,
        private readonly returns: string,
        private readonly type: functionType,
        private readonly source?: string
    ) {}

    public getName(): string {
        return this.name;
    }

    public getParams(): string {
        return this.params;
    }

    public getReturns(): string {
        return this.returns;
    }

    public getType(): functionType {
        return this.type;
    }

    public getSource(): string  | undefined{
        return this.source;
    }
}
