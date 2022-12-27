import { FileContent, FileMetadata } from "."
import { AbilityType, ActionType, Attribute, DamageType, DiceType, EffectCondition, ScalingType, TargetType } from "../dnd"
import { OptionType } from "../editor"

interface AbilityContent {
    text: string
}

interface AbilityMetadata {
    name?: string
    public?: boolean
    description?: string
    notes?: string
    type?: AbilityType
    action?: ActionType
    // Hit condition
    condition?: EffectCondition
    saveAttr?: Attribute
    damageType?: DamageType
    target?: TargetType
    // Range
    range?: number
    rangeLong?: number
    rangeThrown?: number
    // Hit condition roll scaling
    conditionScaling?: ScalingType
    conditionProficiency?: boolean
    conditionModifier?: OptionType<number>
    // Hit effect roll scaling
    effectText?: string
    effectScaling?: ScalingType
    effectProficiency?: boolean
    effectModifier?: OptionType<number>
    effectDice?: DiceType
    effectDiceNum?: number
}

export type {
    AbilityContent,
    AbilityMetadata
}