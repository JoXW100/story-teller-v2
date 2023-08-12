import type { ObjectId as MongoDBObjectId, Document as DBDocument } from 'mongodb'
import { IFileData, IFolderData, IRootData } from './files'

export type UserId = string
export type DateValue = number
export type ErrorMessage = string
export type ObjectId = MongoDBObjectId
export type ObjectIdText = MongoDBObjectId | string

export type DBResponse<T> = {
    success: true
    result: T
} | {
    success: false
    result: ErrorMessage
}

interface DBData extends DBDocument {
    _id?: ObjectId
    _userId: UserId
    _storyId: ObjectId
    _holderId?: ObjectId
    dateCreated: DateValue
    dateUpdated: DateValue
}

export type DBFile = DBData & IFileData
export type DBFolder = DBData & IFolderData
export type DBRoot = DBData & IRootData
export type DBItemData = IFileData | IFolderData | IRootData
export type DBItem = DBData & DBItemData

export type {
    DBData,
    DBDocument
}