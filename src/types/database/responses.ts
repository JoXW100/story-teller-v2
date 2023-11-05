import type { FileType, File, IFileData, IFileMetadata, IFileStructure } from "types/database/files"
import type { IStory, IStoryData } from "./stories"
import type { DateValue, ObjectId } from "."


export type FileMetadataQueryResult<Metadata extends IFileMetadata = IFileMetadata> = {
    id: ObjectId
    type: FileType
    metadata: Metadata
    date?: DateValue
}

export type FileDataQueryResult<Data extends IFileData = IFileData> = {
    id: ObjectId
    type: FileType
    metadata: Data["metadata"]
    storage: Data["storage"]
    date?: DateValue
}

// Stories
export type StoryAddResult = ObjectId
export type StoryGetResult = IStoryData
export type StoryGetAllResult = IStory[]
export type StoryDeleteResult = boolean
export type StoryUpdateResult = boolean

// Files
export type FileAddResult = ObjectId
export type FileAddCopyResult = boolean
export type FileGetResult<T extends IFileData = IFileData> = File<T>
export type FileDeleteResult = boolean
export type FileDeleteFromResult = boolean
export type FileConvertResult = boolean
export type FileRenameResult = boolean
export type FileMoveResult = boolean
export type FileSetPropertyResult = boolean
export type FileGetMetadataResult<T extends IFileMetadata = IFileMetadata> = FileMetadataQueryResult<T>
export type FileGetManyMetadataResult<T extends IFileMetadata = IFileMetadata> = FileMetadataQueryResult<T>[]
export type FileGetManyDataResult<T extends IFileData = IFileData> = FileDataQueryResult<T>[]
export type FileGetStructureResult = IFileStructure[]