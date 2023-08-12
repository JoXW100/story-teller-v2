import type { UserId, DateValue, ObjectId, DBDocument } from "."

interface IStory {
    id: ObjectId
    name: string
    desc: string
    dateCreated: DateValue
    dateUpdated: DateValue
}

interface IStoryData extends IStory {
    root: ObjectId
}

interface DBStory extends DBDocument {
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

export type {
    IStory,
    IStoryData,
    DBStory,
    DBStoryUpdate,
}