import type { ObjectId } from ".."
import type AbilityFile from "./ability"
import type CharacterFile from "./character"
import type ClassFile from "./class"
import type CreatureFile from "./creature"
import type DocumentFile from "./document"
import type EncounterFile from "./encounter"
import type ItemFile from "./item"
import type SpellFile from "./spell"

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
    Ability = "abi",
    Character = "cha",
    Class = "cla",
    Creature = "cre",
    Document = "doc",
    Encounter = "enc",
    Item = "ite",
    Spell = "spe",
}

export type UsedFileTypes = Exclude<FileType, FileType.Empty|FileType.Root>
export type RenderedFileTypes = Exclude<FileType, FileType.Empty|FileType.Root|FileType.Folder>
export type File<T extends IFileData> = IFile & T

export type {
    ISubPageItemMetadata,
    IFolderContent,
    IFileContent,
    IFileMetadata,
    IFileStorage,
    IFileStructure,
    IFile,
    IFileData,
    IFileQueryData,
    IFolderData,
    IRootData
}