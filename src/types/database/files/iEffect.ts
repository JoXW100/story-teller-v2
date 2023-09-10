import type { ISubPageItemMetadata } from ".";
import type { DamageType, DiceType, ScalingType } from "../dnd";
import type { IOptionType } from "../editor";

export enum EffectType {
    MainDamage = "main",
    BonusDamage = "bonus",
    Condition = "condition",
    Other = "other"
}

export enum EffectScaling {
    Level = "level",
    CasterLevel = "casterLevel",
    SpellSlot = "spellSlot"
}

export enum EffectScalingModifierType {
    DiceSize = "diceSize",
    DiceNum = "diceNum",
    Modifier = "modifier"
}

interface IEffectScalingModifier extends ISubPageItemMetadata {
    scaling?: EffectScaling
    scalingValue?: number
    type?: EffectScalingModifierType
    // Changes
    dice?: DiceType
    diceNum?: number
    modifier?: IOptionType<number>
}

interface IEffect extends ISubPageItemMetadata {
    type?: EffectType
    label?: string
    damageType?: DamageType
    text?: string
    scaling?: ScalingType
    proficiency?: boolean
    modifier?: IOptionType<number>
    dice?: DiceType
    diceNum?: number
    // Scaling
    scalingModifiers?: IEffectScalingModifier[]
}

export default IEffect
export type {
    IEffectScalingModifier
}