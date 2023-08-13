import type { OptionalAttribute } from "types/database/dnd"

interface ICreatureStats {
    str?: number
    dex?: number
    con?: number
    int?: number
    wis?: number
    cha?: number
    spellAttribute?: OptionalAttribute,
    proficiency?: number,
    critRange?: number
}

export default ICreatureStats