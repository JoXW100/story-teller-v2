abstract class FileData<T>
{
    public readonly metadata: T;

    constructor(metadata: Partial<T>) {
        this.metadata = metadata ?? {} as any;
    }
}

export default FileData