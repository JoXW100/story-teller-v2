import type { FileType, IFileContent, IFileData, IFileMetadata, IFileStorage } from "."
import type { IModifier } from "./modifier"
import type { ArmorType, DiceType, ItemType, Rarity, RestType, ScalingType } from "../dnd"
import type { IOptionType } from "../editor"
import type IEffect from "./iEffect"

interface IItemContent extends IFileContent {
    text: string
}

interface IItemMetadata extends IFileMetadata {
    type?: ItemType
    rarity?: Rarity
    requiresAttunement?: boolean

    // Armor
    armorType?: ArmorType
    ac?: number
    limitsDex?: boolean
    maxDex?: number
    
    // Weapons
    conditionScaling?: ScalingType
    conditionProficiency?: boolean
    conditionModifier?: IOptionType<number>

    range?: number
    rangeLong?: number
    rangeThrown?: number

    // Hit effect 
    effects?: IEffect[]

    // Modifiers
    modifiers?: IModifier[]
    charges?: number
    chargesReset?: RestType
    chargesDice?: DiceType
    chargesDiceNum?: number
    chargesModifier?: number
}

interface IItemStorage extends IFileStorage {

}

abstract class ItemFile implements IFileData {
    type: FileType.Item
    content: IItemContent
    metadata: IItemMetadata
    storage: IItemStorage
}

export default ItemFile
export type {
    IItemContent,
    IItemMetadata,
    IItemStorage
}