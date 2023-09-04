import type { ISubPageItemMetadata } from ".";
import type { DamageType, DiceType, ScalingType } from "../dnd";
import type { IOptionType } from "../editor";

export enum EffectType {
    MainDamage = "main",
    BonusDamage = "bonus",
    Condition = "condition",
    Other = "other"
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
}

export default IEffect