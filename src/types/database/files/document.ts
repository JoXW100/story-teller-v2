import type { FileType, IFileContent, IFileData, IFileMetadata, IFileStorage } from "."

interface IDocumentContent extends IFileContent {
}

interface IDocumentMetadata extends IFileMetadata {

}

interface IDocumentStorage extends IFileStorage {

}

abstract class DocumentFile implements IFileData {
    type: FileType.Document
    content: IDocumentContent
    metadata: IDocumentMetadata
    storage: IDocumentStorage
}

export type {
    IDocumentContent,
    IDocumentMetadata,
    IDocumentStorage,
    DocumentFile
}
