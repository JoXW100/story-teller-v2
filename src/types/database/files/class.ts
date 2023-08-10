import { FileContent, FileMetadata, Modifier } from "."
import { DiceType } from "../dnd"

interface ClassContent extends FileContent {
    text: string
}

interface ClassMetadata extends FileMetadata {
    name?: string
    description?: string

    hitDice?: DiceType
    modifiers?: Modifier[]
}

export type {
    ClassContent,
    ClassMetadata
}