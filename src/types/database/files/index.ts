import { ObjectId, Document } from 'mongodb'
import { DateValue, UserId } from ".."

type FileMetadata = { [key: string]: any }
type FileContent = { [key: string]: any }

interface DBFile<T extends FileMetadata> extends Document {
    _id?: ObjectId
    _userId: UserId
    _storyId: ObjectId
    _holderId?: ObjectId
    type: FileType
    content: DBContent<T>
    dateCreated: DateValue
    dateUpdated: DateValue
}

interface DBContent<T extends FileMetadata> {
    name: string
    text?: string
    open?: boolean
    metadata?: T
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
    Document = "doc",
    Folder = "folder",
    Creature =  "cre",
    Ability = "abi",
    Character = "cha",
    Spell = "spe"
}

interface FileData<A extends FileContent, B extends FileMetadata> {
    id: ObjectId
    name: string
    type: FileType
    content: A
    metadata: B
}

type FileAddResult = ObjectId
type FileGetResult = FileData<FileContent, FileMetadata>
type FileDeleteResult = boolean
type FileDeleteFromResult = boolean
type FileRenameResult = boolean
type FileMoveResult = boolean
type FileSetPropertyResult = boolean
type FileGetMetadataResult = FileMetadataQueryResult<FileMetadata>
type FileGetManyMetadataResult = FileGetMetadataResult[]
type FileGetStructureResult = FileStructure[]

export type {
    DBFile,
    DBContent,
    FileData,
    FileStructure,
    FileMetadataQueryResult,
    FileMetadata,
    FileContent,
    FileAddResult,
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