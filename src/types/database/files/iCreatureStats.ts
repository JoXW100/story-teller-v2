import type { OptionalAttribute } from "types/database/dnd"

interface ICreatureStats {
    level?: number
    casterLevel?: number
    str?: number
    dex?: number
    con?: number
    int?: number
    wis?: number
    cha?: number
    spellAttribute?: OptionalAttribute
    proficiency?: number
    critRange?: number
    multiAttack?: number
    bonusDamage?: number
}

export default ICreatureStats