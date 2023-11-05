import type { FileType, IFileContent, IFileData, IFileMetadata, IFileStorage } from "."
import type { ICreatureMetadata } from "./creature"
import type { DiceType, Gender } from "../dnd"
import type { ObjectId } from ".."
import type InventoryItemData from "./inventoryItem"

interface ICharacterContent extends IFileContent {
}

interface ICharacterMetadata extends IFileMetadata, ICreatureMetadata {
    simple?: boolean
    gender?: Gender
    age?: string
    height?: string
    weight?: string
    raceText?: string
    occupation?: string
    // Texts
    appearance?: string
    history?: string
    notes?: string
    // Class
    classFile?: ObjectId
}

interface ICharacterAbilityStorageData {
    expendedCharges?: number
}

interface ICharacterStorage extends IFileStorage {
    health?: number
    tempHealth?: number
    hitDice?: Partial<Record<DiceType, number>>
    inventory?: Record<string, InventoryItemData>
    inventoryOther?: string
    attunement?: [ObjectId, ObjectId, ObjectId]
    classData?: Record<string, any>
    cantrips?: ObjectId[]
    learnedSpells?: ObjectId[]
    preparedSpells?: ObjectId[]
    abilityData?: Record<string, ICharacterAbilityStorageData>
    spellData?: number[]
}

abstract class CharacterFile implements IFileData {
    type: FileType.Character
    content: ICharacterContent
    metadata: ICharacterMetadata
    storage: ICharacterStorage
}

export type {
    ICharacterContent,
    ICharacterMetadata,
    ICharacterStorage,
    ICharacterAbilityStorageData,
    CharacterFile
}