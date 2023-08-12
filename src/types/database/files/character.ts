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
    description?: string
    history?: string
    notes?: string
    // Class
    classFile?: ObjectId
}

interface ICharacterStorage extends IFileStorage {
    classData?: Record<string, any>
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
    ICharacterStorage
}