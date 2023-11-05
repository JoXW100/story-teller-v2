import type { IFileContent, IFileMetadata, IFileStorage, FileType, IFileData } from "."
import type { ObjectId } from ".."

interface IEncounterContent extends IFileContent {
}

interface IEncounterCard {
    initiative?: number
    health?: number
    maxHealth?: number
    notes?: string
    group?: number
}

interface IEncounterMetadata extends IFileMetadata {
    creatures?: ObjectId[]
    challenge?: number
    xp?: number
}

interface IEncounterStorage extends IFileStorage {
    cards: IEncounterCard[]
    groups: string[]
}

abstract class EncounterFile implements IFileData {
    type: FileType.Encounter
    content: IEncounterContent
    metadata: IEncounterMetadata
    storage: IEncounterStorage
}

export type {
    IEncounterContent,
    IEncounterMetadata,
    IEncounterStorage,
    IEncounterCard,
    EncounterFile
}