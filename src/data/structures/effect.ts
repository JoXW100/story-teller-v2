import { getOptionType } from "data/optionData";
import { OptionTypeAuto } from "./creature";
import CreatureStats from "./creatureStats";
import { getScalingValue } from "utils/calculations";
import { ScalingType, DiceType, DamageType } from "types/database/dnd";
import { CalculationMode, IOptionType } from "types/database/editor";
import IEffect from "types/database/files/iEffect";
import ICreatureStats from "types/database/files/iCreatureStats";


class Effect implements Required<IEffect> {
    private readonly metadata: IEffect;
    private readonly stats: ICreatureStats;
    private readonly _id?: string

    public constructor(metadata: IEffect, stats: ICreatureStats, id?: string) {
        this.metadata = metadata ?? { id: "" }
        this.stats = new CreatureStats(stats)
        this._id = id;
    }

    public get id(): string {
        return this._id ? `${this._id}-${this.metadata.id}` : this.metadata.id
    }
    

    public get label(): string {
        return this.metadata.label ?? "Effect"
    }

    public get damageType(): DamageType {
        return this.metadata.damageType ?? getOptionType("damageType").default
    }

    public get damageTypeName(): string {
        return getOptionType("damageType").options[this.damageType] ?? String(this.damageType)
    }

    public get text(): string {
        return this.metadata.text ?? ""
    }

    public get scaling(): ScalingType {
        return this.metadata.scaling ?? getOptionType("scaling").default
    }

    public get proficiency(): boolean {
        return this.metadata.proficiency ?? false
    }

    public get modifier(): IOptionType<number> {
        return this.metadata.modifier ?? OptionTypeAuto
    }

    public get modifierValue(): number {
        let mod = this.modifier.value ?? 0;
        let useProf = this.proficiency;
        let prof = useProf ? this.stats.proficiency : 0;
        switch (this.modifier.type) {
            case CalculationMode.Modify:
                return getScalingValue(this.scaling, this.stats) + mod + prof
            case CalculationMode.Override:
                return mod + prof
            case CalculationMode.Auto:
            default:
                return getScalingValue(this.scaling, this.stats) + prof
            
        }
    }

    public get dice(): DiceType {
        return this.metadata.dice ?? getOptionType("dice").default
    }

    public get diceNum(): number {
        return this.metadata.diceNum ?? 1
    }
}

export default Effect