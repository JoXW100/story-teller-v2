import { ObjectId, Document } from 'mongodb'
import { DateValue, UserId } from ".."

type FileMetadata = Record<string, any>
type FileStorage = Record<string, any>
type FileContent = Record<string, any>

interface DBFile<T extends FileMetadata, K extends FileStorage = undefined> extends Document {
    _id?: ObjectId
    _userId: UserId
    _storyId: ObjectId
    _holderId?: ObjectId
    type: FileType
    content: DBContent<T,K>
    dateCreated: DateValue
    dateUpdated: DateValue
}

interface DBContent<T extends FileMetadata, K extends FileStorage> {
    name: string
    text?: string
    open?: boolean
    metadata?: T
    storage?: K
}

interface FileStructure {
    id: ObjectId
    holderId: ObjectId
    type: FileType
    name: string
    open: boolean
    children?: FileStructure[]
}

interface FileMetadataQueryResult<T extends FileMetadata> {
    id: ObjectId,
    type: FileType
    metadata: T
}

export enum FileType {
    Root = "root",
    Empty = "empty",
    Folder = "folder",
    Ability = "abi",
    Character = "cha",
    Creature =  "cre",
    Document = "doc",
    Encounter = "enc",
    Spell = "spe",
}

export type UsedFileTypes = Exclude<FileType, FileType.Root|FileType.Empty>
export type RenderedFileTypes = Exclude<FileType, FileType.Root|FileType.Empty|FileType.Folder>

interface FileData<A extends FileContent, B extends FileMetadata, C extends FileStorage> {
    id: ObjectId
    name: string
    type: FileType
    isOwner: boolean
    content: A
    metadata: B
    storage: C
}

type FileAddResult = ObjectId
type FileAddCopyResult = boolean
type FileGetResult = FileData<FileContent, FileMetadata, FileStorage>
type FileDeleteResult = boolean
type FileDeleteFromResult = boolean
type FileRenameResult = boolean
type FileMoveResult = boolean
type FileSetPropertyResult = boolean
type FileGetMetadataResult<T extends FileMetadata = FileMetadata> = FileMetadataQueryResult<T>
type FileGetManyMetadataResult<T extends FileMetadata = FileMetadata> = FileGetMetadataResult<T>[]
type FileGetStructureResult = FileStructure[]

export type {
    DBFile,
    DBContent,
    FileData,
    FileStructure,
    FileMetadataQueryResult,
    FileMetadata,
    FileStorage,
    FileContent,
    FileAddResult,
    FileAddCopyResult,
    FileGetResult,
    FileDeleteResult,
    FileDeleteFromResult,
    FileRenameResult,
    FileMoveResult,
    FileSetPropertyResult,
    FileGetMetadataResult,
    FileGetManyMetadataResult,
    FileGetStructureResult
}