import { Gender } from "../dnd"
import { CreatureMetadata } from "./creature"

interface CharacterContent {
    text: string
}

interface CharacterMetadata extends CreatureMetadata {
    simple?: boolean
    gender?: Gender
    age?: string
    height?: string
    weight?: string
    raceText?: string
    occupation?: string
    traits?: string[]
    // Texts
    appearance?: string
    description?: string
    history?: string
    notes?: string
}

export type {
    CharacterContent,
    CharacterMetadata
}