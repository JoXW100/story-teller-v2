import type { FileType, IFileContent, IFileData, IFileMetadata, IFileStorage } from "."
import type { IModifier } from "./modifier"
import type { ArmorType, ItemType, MeleeWeaponType, RangedWeaponType, Rarity, ThrownWeaponType } from "../dnd"

interface IItemContent extends IFileContent {
}

interface IItemMetadata extends IFileMetadata {
    type?: ItemType
    rarity?: Rarity
    weight?: number
    value?: number
    notes?: string
    requiresAttunement?: boolean

    // Subtype
    armorType?: ArmorType
    meleeWeaponType?: MeleeWeaponType
    rangedWeaponType?: RangedWeaponType
    thrownWeaponType?: ThrownWeaponType

    // Modifiers
    modifiers?: IModifier[]
}

interface IItemStorage extends IFileStorage {

}

abstract class ItemFile implements IFileData {
    type: FileType.Item
    content: IItemContent
    metadata: IItemMetadata
    storage: IItemStorage
}

export type {
    IItemContent,
    IItemMetadata,
    IItemStorage,
    ItemFile
}