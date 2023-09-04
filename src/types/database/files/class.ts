import type { IFileContent, IFileMetadata, IFileStorage, FileType, IFileData } from "."
import type { ObjectId } from ".."
import type { DiceType, OptionalAttribute } from "../dnd"
import type { IModifier } from "./modifier"

interface IClassContent extends IFileContent {
}

interface IClassLevels {
    1?: IModifier[]
    2?: IModifier[]
    3?: IModifier[]
    4?: IModifier[]
    5?: IModifier[]
    6?: IModifier[]
    7?: IModifier[]
    8?: IModifier[]
    9?: IModifier[]
    10?: IModifier[]
    11?: IModifier[]
    12?: IModifier[]
    13?: IModifier[]
    14?: IModifier[]
    15?: IModifier[]
    16?: IModifier[]
    17?: IModifier[]
    18?: IModifier[]
    19?: IModifier[]
    20?: IModifier[]
}

interface IClassMetadataProperties {
    isSubclass?: boolean
    hasLeveledHitDice?: boolean
    hitDice?: DiceType
    leveledHitDice?: DiceType[]
    subclassLevel: number
    subclasses?: ObjectId[]
    // Spells
    spellAttribute?: OptionalAttribute
    spellSlots?: number[][]
    preparationSlots?: number[]
    preparationSlotsScaling?: OptionalAttribute
    preparationAll?: boolean
    cantripSlots?: number[]
    learnedSlots?: number[]
    learnedAll?: boolean
    canRitualCast?: boolean
}

interface IClassMetadata extends IClassMetadataProperties, IClassLevels, IFileMetadata {

}

interface IClassStorage extends IFileStorage {
    
}

abstract class ClassFile implements IFileData {
    type: FileType.Class
    content: IClassContent
    metadata: IClassMetadata
    storage: IClassStorage
}

export default ClassFile
export type {
    IClassContent,
    IClassLevels,
    IClassMetadataProperties,
    IClassMetadata,
    IClassStorage
}
