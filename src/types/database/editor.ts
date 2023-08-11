import React from "react"
import { FileContent, FileData, FileMetadata, IFileMetadataQueryResult } from "./files"
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

export enum ModifierType {
    Bonus = "bonus", // Adds/Removes a flat value
    Set = "set", // Sets value
    Add = "add", // Adds item to collection
    Remove = "remove" // Removes item from collection
}

export enum ModifierSelectType {
    Value = "value",
    Choice = "choice",
}

export enum ModifierCondition {
    None = "none",
}

export enum ModifierSetMethod {
    Exact = "exact",
    Max = "max",
    Min = "min"
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

type OptionType<T> = { type: CalculationMode.Auto } | IOptionType<T>

interface RendererObject<A extends FileContent,B extends FileMetadata> {
    fileRenderer: (props: React.PropsWithRef<{ file: FileData<A, B, any>, stats?: ICreatureStats }>) => JSX.Element
    linkRenderer: (props: React.PropsWithRef<{ file: IFileMetadataQueryResult<B>, stats?: ICreatureStats }>) => JSX.Element
}

export type {
    OptionType,
    IOptionType,
    RendererObject
}