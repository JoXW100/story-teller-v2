import type { FileType, IFileContent, IFileData, IFileMetadata, IFileStorage } from "."
import type { IModifier } from "./modifier"
import type ICreatureActionData from "./iConditionalHitEffect"
import type { AbilityType, ActionType, DiceType } from "../dnd"

interface IAbilityContent extends IFileContent {
    text: string
}

interface IAbilityMetadata extends IFileMetadata, ICreatureActionData {
    type?: AbilityType
    versatile?: boolean
    action?: ActionType
    // Range
    range?: number
    rangeLong?: number
    rangeThrown?: number
    effectVersatileDice?: DiceType
    // Modifiers
    modifiers?: IModifier[]
}

interface IAbilityStorage extends IFileStorage {

}

abstract class AbilityFile implements IFileData {
    type: FileType.Ability
    content: IAbilityContent
    metadata: IAbilityMetadata
    storage: IAbilityStorage
}

export default AbilityFile
export type {
    IAbilityContent,
    IAbilityMetadata,
    IAbilityStorage
}