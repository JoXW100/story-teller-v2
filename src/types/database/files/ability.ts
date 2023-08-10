import { FileContent, FileMetadata, Modifier } from "."
import { AbilityType, ActionType, DiceType, ModifierBonusTypeProperty, ModifierType } from "../dnd"
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
    // Modifiers
    modifiers?: Modifier[]
}

export type {
    AbilityContent,
    AbilityMetadata
}