
type Open5eFetchType = "spells" | "monsters"

interface Open5eItemInfo {
    slug: string
    name: string
    level_int?: number
    [key: string]: any
}

interface ICompendiumMenuItem {
    title: string
    type: Open5eFetchType
    fields: string[]
    sortFields: string[]
    headers: string[]
    query?: Record<string, string | number>
    subItems?: ICompendiumMenuItem[]
}

export type {
    Open5eFetchType,
    Open5eItemInfo,
    ICompendiumMenuItem
}