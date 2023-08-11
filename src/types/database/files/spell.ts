import { FileContent, FileMetadata } from "."
import { Duration, AreaType, CastingTime, MagicSchool } from "../dnd"
import ICreatureActionData from "./iConditionalHitEffect"

interface SpellContent extends FileContent {
    text: string
}

interface SpellMetadata extends FileMetadata, ICreatureActionData {
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

export type {
    SpellContent,
    SpellMetadata
}