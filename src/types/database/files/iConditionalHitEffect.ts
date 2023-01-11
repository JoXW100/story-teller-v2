import { DiceType, ScalingType, Attribute, DamageType, EffectCondition, TargetType } from "../dnd"
import { OptionType } from "../editor"

interface ICreatureActionData {
    name?: string
    public?: boolean
    description?: string
    notes?: string
    // Hit condition
    condition?: EffectCondition
    saveAttr?: Attribute
    damageType?: DamageType
    target?: TargetType
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

export default ICreatureActionData