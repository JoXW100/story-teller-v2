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

interface IItemMetadata {
    id: string
}

interface IFileStorage {

}

interface IFileStructure {
    id: ObjectId
    holderId: ObjectId
    type: FileType
    name: string
    open: boolean
    children: IFileStructure[]
}

interface IFile extends IFileData {
    id: ObjectId
    isOwner: boolean
}

interface IFileData {
    type: Exclude<FileType, FileType.Folder | FileType.Root>
    content: IFileContent
    metadata: IFileMetadata
    storage: IFileStorage
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
    Ability = "abi",
    Character = "cha",
    Class = "cla",
    Creature = "cre",
    Document = "doc",
    Encounter = "enc",
    Spell = "spe",
}

export type UsedFileTypes = Exclude<FileType, FileType.Empty|FileType.Root>
export type RenderedFileTypes = Exclude<FileType, FileType.Empty|FileType.Root|FileType.Folder>
export type File<T extends IFileData> = IFile & T

export type {
    IItemMetadata,
    IFolderContent,
    IFileContent,
    IFileMetadata,
    IFileStorage,
    IFileStructure,
    IFile,
    IFileData,
    IFolderData,
    IRootData
}