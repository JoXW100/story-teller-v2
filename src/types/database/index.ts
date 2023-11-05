import type { ObjectId as MongoDBObjectId } from 'mongodb'
import type { IFileData, IFolderData, IRootData } from './files'

export type UserId = string
export type DateValue = number
export type ObjectId = MongoDBObjectId
export type ObjectIdText = MongoDBObjectId | string

export type DBResponse<T> = {
    success: true
    result: T
} | {
    success: false
    result: string
}

interface DBData {
    _id?: ObjectId
    _userId: UserId
    _storyId: ObjectId
    _holderId?: ObjectId // FolderId
    dateCreated: DateValue
    dateUpdated: DateValue
}

export type DBFile = DBData & IFileData
export type DBFolder = DBData & IFolderData
export type DBRoot = DBData & IRootData
export type DBItemData = IFileData | IFolderData | IRootData
export type DBItem = DBData & DBItemData

export type {
    DBData
}