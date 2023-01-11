import { FileMetadata } from "types/database/files";


abstract class FileData<T extends FileMetadata>
{
    public readonly metadata: T;

    constructor(metadata: T) {
        this.metadata = metadata ?? {} as any;
    }
}

export default FileData