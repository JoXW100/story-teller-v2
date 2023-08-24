import { OptionalAttribute } from "types/database/dnd"


interface ISpellProgression {
    spellAttribute: OptionalAttribute
    spellSlots: number[]
    preparationSlots: number[]
    cantripSlots: number[]
    learnedSlots: number[]
    learnedSlotsScaling: OptionalAttribute
    learnedAll: boolean
}


export default ISpellProgression