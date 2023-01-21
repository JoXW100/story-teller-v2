import React from "react"
import { FileContent, FileData, FileMetadata, FileMetadataQueryResult } from "./files"
import ICreatureStats from "./files/iCreatureStats"

export enum CalculationMode {
    Auto,
    Override,
    Modify
}

export enum OptionalAttribute {
    None = "none",
    STR = "str",
    DEX = "dex",
    CON = "con",
    INT = "int",
    WIS = "wis",
    CHA = "cha"
}

interface OptionType<T> { 
    type: CalculationMode
    value: T 
}

interface RendererObject<A extends FileContent,B extends FileMetadata> {
    fileRenderer: (props: React.PropsWithRef<{ file: FileData<A, B, any>, stats?: ICreatureStats }>) => JSX.Element
    linkRenderer: (props: React.PropsWithRef<{ file: FileMetadataQueryResult<B>, stats?: ICreatureStats }>) => JSX.Element
}

export type {
    OptionType,
    RendererObject
}