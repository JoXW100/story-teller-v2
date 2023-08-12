import { IFileMetadata } from "./database/files"
import { FileGetMetadataResult } from "./database/responses"

export type Variables = Record<string, any>
export type VariablesCollection = Record<string, Variables>
export type Queries = Record<string, QueryType>
export type QueryCollection = Record<string, FileGetMetadataResult>

export enum QueryType {
    Title = 0,
    Content = 1
}

export enum RollMode {
    Dice = 'dice',
    Mod = 'mod',
    DMG = 'dmg'
}

export enum AlignDirection {
    Center = 'c',
    Horizontal = 'h',
    Vertical = 'v'
}

interface IParserMetadata extends IFileMetadata { 
    $vars?: VariablesCollection
    $queries?: QueryCollection
}

interface IParserOption { 
    key: string
    value: string 
}

interface IParserObject {
    type: string
    content: IParserObject[]
    options: IParserOption[]
    variables: Variables
}

interface IElementObject {
    type: string
    defaultKey: string
    buildChildren: boolean
    validOptions: Set<string>
    validate: (options: Variables, content: IParserObject[]) => Queries
    toComponent: (params: ElementParams) => JSX.Element
}

type ElementParams<T extends Variables = Variables> = React.PropsWithChildren<{
    options?: T,
    content?: IParserObject[],
    metadata?: IParserMetadata,
    variablesKey?: string
}>;

export type {
    IParserOption,
    IParserObject,
    IElementObject,
    IParserMetadata,
    ElementParams
}