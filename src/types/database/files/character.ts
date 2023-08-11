import { FileContent, FileStorage } from "."
import { ObjectId } from ".."
import { Gender } from "../dnd"
import { CreatureMetadata } from "./creature"

interface CharacterContent extends FileContent {
    text: string
}

interface CharacterStorage extends FileStorage {
    classData?: Record<string, any>
}

interface CharacterMetadata extends CreatureMetadata {
    simple?: boolean
    gender?: Gender
    age?: string
    height?: string
    weight?: string
    raceText?: string
    occupation?: string
    // Texts
    appearance?: string
    description?: string
    history?: string
    notes?: string
    // Class
    class?: ObjectId
}

export type {
    CharacterContent,
    CharacterMetadata,
    CharacterStorage
}