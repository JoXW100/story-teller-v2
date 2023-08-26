import type { FileType, IFileContent, IFileData, IFileMetadata, IFileStorage } from "."
import type { ICreatureMetadata } from "./creature"
import type { Gender } from "../dnd"
import type { ObjectId } from ".."

interface ICharacterContent extends IFileContent {
    text: string
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
    inventory?: ObjectId[]
    equipped?: ObjectId[]
    attuned?: ObjectId[]

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

export default CharacterFile
export type {
    ICharacterContent,
    ICharacterMetadata,
    ICharacterStorage,
    ICharacterAbilityStorageData
}