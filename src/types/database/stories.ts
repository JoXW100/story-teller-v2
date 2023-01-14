import { ObjectId, Document } from 'mongodb'
import { UserId, DateValue } from "."

interface Story {
    id: ObjectId
    name: string
    desc: string
    dateCreated: DateValue
    dateUpdated: DateValue
}

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

interface StoryData extends Story {
    root: ObjectId
}

type StoryAddResult = ObjectId
type StoryGetResult = StoryData
type StoryGetAllResult = Story[]
type StoryDeleteResult = boolean
type StoryUpdateResult = boolean

export type {
    Story,
    DBStory,
    DBStoryUpdate,
    StoryData,
    StoryAddResult,
    StoryGetResult,
    StoryDeleteResult,
    StoryUpdateResult,
    StoryGetAllResult
}