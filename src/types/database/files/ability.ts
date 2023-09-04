import type { FileType, IFileContent, IFileData, IFileMetadata, IFileStorage } from "."
import type { IModifier } from "./modifier"
import type ICreatureActionData from "./iConditionalHitEffect"
import type { AbilityType, ActionType, RestType } from "../dnd"

interface IAbilityContent extends IFileContent {
}

interface IAbilityMetadata extends IFileMetadata, ICreatureActionData {
    type?: AbilityType
    action?: ActionType
    // Range
    range?: number
    rangeLong?: number
    rangeThrown?: number
    // Modifiers
    modifiers?: IModifier[]
    charges?: number[]
    chargesReset?: RestType
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