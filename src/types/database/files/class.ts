import { FileContent, FileMetadata, Modifier, ModifierCollection } from "."
import { DiceType } from "../dnd"

interface ClassContent extends FileContent {
    text: string
}

interface ClassLevelsMetadata {
    1?: Modifier[]
    2?: Modifier[]
    3?: Modifier[]
    4?: Modifier[]
    5?: Modifier[]
    6?: Modifier[]
    7?: Modifier[]
    8?: Modifier[]
    9?: Modifier[]
    10?: Modifier[]
    11?: Modifier[]
    12?: Modifier[]
    13?: Modifier[]
    14?: Modifier[]
    15?: Modifier[]
    16?: Modifier[]
    17?: Modifier[]
    18?: Modifier[]
    19?: Modifier[]
    20?: Modifier[]
}

interface ClassMetadataProperties {
    description?: string
    hitDice?: DiceType

    getModifiers?: (level: number) => ModifierCollection
}

interface ClassMetadata extends ClassMetadataProperties, ClassLevelsMetadata, FileMetadata {}

export type {
    ClassContent,
    ClassLevelsMetadata,
    ClassMetadataProperties,
    ClassMetadata,
}