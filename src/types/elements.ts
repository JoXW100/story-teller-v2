import { FileGetMetadataResult } from "./database/files"

interface Variables {
    [key: string]: string
}

export enum QueryType {
    Title = 0,
    Content = 1
}

export enum RollMode {
    Dice = 'dice',
    Mod = 'mod',
    DMG = 'dmg'
}

interface Queries {
    [key: string]: QueryType
}

interface QueryResult {
    [key: string]: FileGetMetadataResult
}

interface Metadata { 
    $vars?: Variables
    $queries?: QueryResult
    [key: string]: any
}

interface ParserOption { 
    key: string
    value: string 
}

interface ParserObject {
    type: string
    content: ParserObject[]
    options: ParserOption[]
    variables: Variables
}

type ElementParams<T extends Variables> = React.PropsWithChildren<{
    options?: T,
    metadata?: Metadata
}>;

interface ElementObject {
    type: string
    defaultKey: string
    validOptions: Set<string>
    validate: (options: Variables) => Queries
    toComponent: (params: ElementParams<any>) => JSX.Element
}

export type {
    Variables,
    Queries,
    QueryResult,
    Metadata,
    ParserOption,
    ParserObject,
    ElementObject,
    ElementParams
}