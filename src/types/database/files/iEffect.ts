import type { ISubPageItemMetadata } from ".";
import type { DamageType, DiceType, ScalingType } from "../dnd";
import type { IOptionType } from "../editor";


interface IEffect extends ISubPageItemMetadata {
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