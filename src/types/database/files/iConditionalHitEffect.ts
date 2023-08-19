import type { ScalingType, Attribute, EffectCondition, TargetType } from "../dnd"
import type { IOptionType } from "../editor"
import type IEffect from "./effect"

interface ICreatureActionData {
    notes?: string
    // Hit condition
    condition?: EffectCondition
    saveAttr?: Attribute
    target?: TargetType
    // Hit condition roll scaling
    conditionScaling?: ScalingType
    conditionProficiency?: boolean
    conditionModifier?: IOptionType<number>
    // Hit effect 
    effects?: IEffect[]
}

export default ICreatureActionData