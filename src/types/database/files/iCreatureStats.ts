import { OptionalAttribute } from "../editor"

interface ICreatureStats {
    str?: number
    dex?: number
    con?: number
    int?: number
    wis?: number
    cha?: number
    spellAttribute?: OptionalAttribute,
    proficiency?: number
}

export default ICreatureStats