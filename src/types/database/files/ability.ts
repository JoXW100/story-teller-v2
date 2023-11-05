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
    // Charges
    charges?: number[]
    chargesReset?: RestType
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

export type {
    IAbilityContent,
    IAbilityMetadata,
    IAbilityStorage,
    AbilityFile
}