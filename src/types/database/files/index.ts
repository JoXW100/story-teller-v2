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

interface ILocalFile {
    id: string
    holderId: string
    type: FileType
    name: string
    open?: boolean
    data?: string | ArrayBuffer
}

interface IFile extends IFileData {
    id: ObjectId
    isOwner: boolean
}

interface IFileData {
    type: Exclude<FileType, FileType.Folder|FileType.Root>
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


type File<T extends IFileData> = {
    id: ObjectId
    isOwner: boolean
} & T

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

type RenderedFileTypes = Exclude<FileType, FileType.Empty|FileType.Folder|FileType.LocalFolder|FileType.LocalImage|FileType.Root>

export type {
    ISubPageItemMetadata,
    IFolderContent,
    IFile,
    IFileContent,
    IFileMetadata,
    IFileStorage,
    IFileStructure,
    ILocalFile,
    IFileData,
    IFileQueryData,
    IFolderData,
    IRootData,
    File,
    RenderedFileTypes
}