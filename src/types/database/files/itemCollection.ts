import type { IModifierCollection } from "./modifierCollection"
import type { IAbilityMetadata } from "./ability"
 
interface IItemCollection {
    ac: number
    limitsDex: boolean
    maxDex: number

    abilities: IAbilityMetadata[]
    modifiers: IModifierCollection
}

export type {
    IItemCollection
}