import React from "react"
import { FileContent, FileData, FileMetadata, FileMetadataQueryResult } from "./files"
import { CharacterStats } from "./files/character"

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
    fileRenderer: (props: React.PropsWithRef<{ file: FileData<A, B>, stats?: CharacterStats }>) => JSX.Element
    linkRenderer: (props: React.PropsWithRef<{ file: FileMetadataQueryResult<B>, stats?: CharacterStats }>) => JSX.Element
}

export type {
    OptionType,
    RendererObject
}