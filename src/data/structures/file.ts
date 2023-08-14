import { IParserMetadata, QueryCollection, VariablesCollection } from "types/elements";

abstract class FileData<T extends IParserMetadata> implements IParserMetadata
{
    public readonly metadata: T;

    constructor(metadata: Partial<T>) {
        this.metadata = metadata ?? {} as any;
    }

    public get $vars(): VariablesCollection {
        return this.metadata.$vars ?? {}
    }

    public set $vars(value: VariablesCollection) {
        this.metadata.$vars = value
    }

    public get $queries(): QueryCollection {
        return this.metadata.$queries ?? {}
    }

    public set $queries(value: QueryCollection) {
        this.metadata.$queries = value
    }

    public get name(): string {
        return this.metadata.name ?? ""
    }

    public get description(): string {
        return this.metadata.description ?? ""
    }
}

export default FileData