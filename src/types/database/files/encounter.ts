import type { IFileContent, IFileMetadata, IFileStorage, FileType, IFileData } from "."

interface IEncounterContent extends IFileContent {
    text: string
}

interface IEncounterCardData {
    initiative?: number,
    maxHealth?: number,
    health?: number,
    notes?: string
}

interface IEncounterMetadata extends IFileMetadata {
    creatures?: string[]
    challenge?: number
    xp?: number
}

interface IEncounterStorage extends IFileStorage {
    cards: IEncounterCardData[]
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
    IEncounterCardData
}