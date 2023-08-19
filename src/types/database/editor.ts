import type { File, IFileData } from "types/database/files"
import type ICreatureStats from "./files/iCreatureStats"
import type { FileMetadataQueryResult } from "./responses"

export enum CalculationMode {
    Auto,
    Override,
    Modify
}

export enum RenderedFileType {
    Ability = "abi",
    Character = "cha",
    Class = "cla",
    Creature =  "cre",
    Document = "doc",
    Encounter = "enc",
    Spell = "spe",
}

interface IOptionType<T> { 
    type: CalculationMode
    value: T 
}

const OptionTypeAuto: IOptionType<number> = {
    type: CalculationMode.Auto,
    value: 0
}

export type OptionType<T> = { type: CalculationMode.Auto } | IOptionType<T>

interface RendererObject<T extends IFileData = IFileData> {
    fileRenderer: (props: React.PropsWithRef<{ file: File<T>, stats?: ICreatureStats }>) => JSX.Element
    linkRenderer: (props: React.PropsWithRef<{ file: FileMetadataQueryResult<T["metadata"]>, stats?: ICreatureStats }>) => JSX.Element
}

export type {
    IOptionType,
    RendererObject
}

export {
    OptionTypeAuto
}