import { FileContent, FileMetadata } from "."
import { AbilityType, ActionType, DiceType } from "../dnd"
import ICreatureActionData from "./iConditionalHitEffect"

interface AbilityContent extends FileContent {
    text: string
}

interface AbilityMetadata extends FileMetadata, ICreatureActionData {
    type?: AbilityType
    versatile?: boolean
    action?: ActionType
    // Range
    range?: number
    rangeLong?: number
    rangeThrown?: number
    effectVersatileDice?: DiceType
}

export type {
    AbilityContent,
    AbilityMetadata
}