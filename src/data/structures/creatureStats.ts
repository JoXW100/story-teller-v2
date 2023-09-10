import { getOptionType } from "data/optionData"
import { OptionalAttribute } from "types/database/dnd"
import ICreatureStats from "types/database/files/iCreatureStats"

class CreatureStats implements Required<ICreatureStats> {
    public readonly data: ICreatureStats
    public constructor(stats: ICreatureStats = {}) {
        this.data = stats ?? {}
    }

    public get level(): number {
        return this.data.level ?? 0
    }
    public get casterLevel(): number {
        return this.data.casterLevel ?? 0
    }

    public get proficiency(): number {
        return this.data.proficiency ?? 2
    }

    public get spellAttribute(): OptionalAttribute {
        return this.data.spellAttribute ?? getOptionType("optionalAttr").default
    }

    public get multiAttack(): number {
        return this.data.multiAttack ?? 1
    }

    public get bonusDamage(): number {
        return this.data.bonusDamage ?? 0
    }

    public get critRange(): number {
        return this.data.critRange ?? 20
    }

    public get str(): number {
        return this.data.str ?? 10
    }

    public get dex(): number {
        return this.data.dex ?? 10
    }

    public get con(): number {
        return this.data.con ?? 10
    }

    public get int(): number {
        return this.data.int ?? 10
    }

    public get wis(): number {
        return this.data.wis ?? 10
    }

    public get cha(): number {
        return this.data.cha ?? 10
    }
}

export default CreatureStats