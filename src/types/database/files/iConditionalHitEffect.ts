import type { DiceType, ScalingType, Attribute, DamageType, EffectCondition, TargetType } from "../dnd"
import type { IOptionType } from "../editor"

interface ICreatureActionData {
    notes?: string
    // Hit condition
    condition?: EffectCondition
    saveAttr?: Attribute
    damageType?: DamageType
    target?: TargetType
    // Hit condition roll scaling
    conditionScaling?: ScalingType
    conditionProficiency?: boolean
    conditionModifier?: IOptionType<number>
    // Hit effect roll scaling
    effectText?: string
    effectScaling?: ScalingType
    effectProficiency?: boolean
    effectModifier?: IOptionType<number>
    effectDice?: DiceType
    effectDiceNum?: number
}

export default ICreatureActionData