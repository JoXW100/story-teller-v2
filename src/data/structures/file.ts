import { IParserMetadata, QueryCollection, VariablesCollection } from "types/elements";

abstract class FileData<T extends IParserMetadata> implements Required<IParserMetadata>
{
    public readonly metadata: Partial<T>;

    constructor(metadata: Partial<T>) {
        this.metadata = metadata ?? {};
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

    public get $values(): Record<string, number> {
        return this.metadata.$values ?? {}
    }

    public set $values(value: Record<string, number>) {
        this.metadata.$values = value
    }

    public get name(): string {
        return this.metadata.name ?? ""
    }

    public get description(): string {
        return this.metadata.description ?? ""
    }
}

export default FileData