import type { IFileContent, IFileMetadata, IFileStorage, FileType, IFileData } from "."
import { ObjectId } from ".."

interface IEncounterContent extends IFileContent {
}

interface IEncounterCard {
    initiative?: number
    health?: number
    maxHealth?: number
    notes?: string
}

interface IEncounterMetadata extends IFileMetadata {
    creatures?: ObjectId[]
    challenge?: number
    xp?: number
}

interface IEncounterStorage extends IFileStorage {
    cards: IEncounterCard[]
}

abstract class EncounterFile implements IFileData {
    type: FileType.Encounter
    content: IEncounterContent
    metadata: IEncounterMetadata
    storage: IEncounterStorage
}

export default EncounterFile
export type {
    IEncounterContent,
    IEncounterMetadata,
    IEncounterStorage,
    IEncounterCard
}