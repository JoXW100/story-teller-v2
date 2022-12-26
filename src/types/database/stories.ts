import { ObjectId, Document } from 'mongodb'
import { UserId, DateValue } from "."

interface DBStory extends Document {
    _id?: ObjectId
    _userId: UserId
    name: string
    desc: string
    dateCreated: DateValue
    dateUpdated: DateValue
}

interface DBStoryUpdate {
    name?: string
    desc?: string
}

interface StoryData {
    id: ObjectId
    root: ObjectId
    name: string
    desc: string
    dateCreated: DateValue
    dateUpdated: DateValue
}

type StoryAddResult = ObjectId
type StoryGetResult = StoryData
type StoryGetAllResult = DBStory[]
type StoryDeleteResult = boolean
type StoryUpdateResult = boolean

export type {
    DBStory,
    DBStoryUpdate,
    StoryData,
    StoryAddResult,
    StoryGetResult,
    StoryDeleteResult,
    StoryUpdateResult,
    StoryGetAllResult
}