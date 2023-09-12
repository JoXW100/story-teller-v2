import type { ObjectId } from ".."

interface IFileContent {
    name: string
    public: boolean
    text: string
}

interface IFolderContent {
    name: string
    open: boolean
}

interface IFileMetadata {
    name: string
    description: string
}

interface ISubPageItemMetadata {
    id: string
}

interface IFileStorage {

}

interface IFileStructure {
    id: ObjectId | string
    holderId: ObjectId | string
    type: FileType
    name: string
    open: boolean
    children: IFileStructure[]
}

interface IFile extends IFileData {
    id: ObjectId
    isOwner: boolean
}

interface ILocalFile {
    id: string
    holderId: string
    type: FileType
    name: string
    open?: boolean
    data?: string
}

interface IFileData {
    type: Exclude<FileType, FileType.Folder | FileType.Root>
    content: IFileContent
    metadata: IFileMetadata
    storage: IFileStorage
}

interface IFileQueryData<T extends IFileData = IFileData> {
    metadata: T["metadata"]
    storage: T["storage"]
}

interface IFolderData {
    type: FileType.Folder
    content: IFolderContent
}

interface IRootData {
    type: FileType.Root
}

export enum FileType {
    Root = "root",
    Empty = "empty",
    Folder = "folder",
    LocalFolder = "localFolder",
    LocalImage = "img",
    Ability = "abi",
    Character = "cha",
    Class = "cla",
    Creature = "cre",
    Document = "doc",
    Encounter = "enc",
    Item = "ite",
    Spell = "spe",
}

export type FileStructureTypes = FileType.Root|FileType.Folder|FileType.LocalFolder|FileType.LocalImage
export type UsedFileTypes = Exclude<FileType, FileType.Empty|FileType.Root|FileType.LocalFolder|FileType.LocalImage>
export type RenderedFileTypes = Exclude<FileType, FileType.Empty|FileStructureTypes>
export type File<T extends IFileData> = IFile & T

export type {
    ISubPageItemMetadata,
    IFolderContent,
    IFileContent,
    IFileMetadata,
    IFileStorage,
    IFileStructure,
    IFile,
    ILocalFile,
    IFileData,
    IFileQueryData,
    IFolderData,
    IRootData
}