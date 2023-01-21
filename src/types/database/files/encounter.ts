import { FileContent, FileMetadata, FileStorage } from "."

interface EncounterContent extends FileContent {
    text: string
}

interface IEncounterCardData {
    initiative?: number,
    maxHealth?: number,
    health?: number,
    notes?: string
}

interface EncounterMetadata extends FileMetadata {
    name?: string
    description?: string
    public?: boolean
    creatures?: string[]
    challenge?: number
    xp?: number
}

interface EncounterStorage extends FileStorage {
    cards: IEncounterCardData[]
}

export type {
    EncounterContent,
    EncounterMetadata,
    EncounterStorage,
    IEncounterCardData
}