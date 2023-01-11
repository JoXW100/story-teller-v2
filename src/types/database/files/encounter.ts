import { FileContent, FileMetadata } from "."

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

export type {
    EncounterContent,
    EncounterMetadata,
    IEncounterCardData
}