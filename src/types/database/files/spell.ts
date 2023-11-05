import type { IFileContent, IFileMetadata, IFileStorage, FileType, IFileData } from "."
import type { Duration, AreaType, CastingTime, MagicSchool } from "../dnd"
import type ICreatureActionData from "./iConditionalHitEffect"

interface ISpellContent extends IFileContent {
    text: string
}

interface ISpellMetadata extends IFileMetadata, ICreatureActionData {
    level?: number
    school?: MagicSchool
    time?: CastingTime
    timeCustom?: string
    timeValue?: number
    duration?: Duration
    durationValue?: number
    ritual?: boolean
    concentration?: boolean
    componentVerbal?: boolean
    componentSomatic?: boolean
    componentMaterial?: boolean
    materials?: string
    // Range
    range?: number
    rangeLong?: number
    area?: AreaType
    areaSize?: number
    areaHeight?: number
}

interface ISpellStorage extends IFileStorage {
}

abstract class SpellFile implements IFileData {
    type: FileType.Spell
    content: ISpellContent
    metadata: ISpellMetadata
    storage: ISpellStorage
}

export type {
    ISpellContent,
    ISpellMetadata,
    ISpellStorage,
    SpellFile
}