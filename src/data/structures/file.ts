abstract class FileData<T>
{
    public readonly metadata: T;

    constructor(metadata: T) {
        this.metadata = metadata ?? {} as any;
    }
}

export default FileData