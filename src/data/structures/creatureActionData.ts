import { getOptionType } from "data/optionData";
import FileData from "./file";
import { OptionTypeAuto } from "./creature";
import CreatureStats from "./creatureStats";
import IEffect from "types/database/files/iEffect";
import { getScalingValue } from "utils/calculations";
import { Attribute, EffectCondition, ScalingType, TargetType } from "types/database/dnd";
import { CalculationMode, IOptionType } from "types/database/editor";
import ICreatureActionData from "types/database/files/iConditionalHitEffect";
import ICreatureStats from "types/database/files/iCreatureStats";
import { IFileMetadata } from "types/database/files";

abstract class CreatureActionData<T extends ICreatureActionData & IFileMetadata> extends FileData<T> implements Required<ICreatureActionData & IFileMetadata> {
    public readonly stats: CreatureStats

    constructor(metadata: T, stats: ICreatureStats = null) {
        super(metadata)
        this.stats = new CreatureStats(stats)
    }

    public get notes(): string {
        return this.metadata.notes ?? ""
    }

    // Hit condition

    public get condition(): EffectCondition {
        return this.metadata.condition ?? getOptionType("effectCondition").default
    }

    public get saveAttr(): Attribute {
        return this.metadata.saveAttr ?? getOptionType("attr").default
    }

    public get target(): TargetType {
        return this.metadata.target ?? getOptionType("target").default
    }

    // Hit condition roll scaling

    public get conditionScaling(): ScalingType {
        return this.metadata.conditionScaling ?? getOptionType("scaling").default
    }

    public get conditionProficiency(): boolean {
        return this.metadata.conditionProficiency ?? false
    }

    public get conditionModifier(): IOptionType<number> {
        return this.metadata.conditionModifier ?? OptionTypeAuto
    }

    public get conditionModifierValue(): number {
        let mod = this.conditionModifier.value ?? 0;
        let useProf = this.conditionProficiency;
        let prof = useProf ? this.stats.proficiency ?? 0 : 0;
        switch (this.conditionModifier.type) {
            case CalculationMode.Modify:
                return getScalingValue(this.conditionScaling, this.stats) + mod + prof
            case CalculationMode.Override:
                return mod + prof
            case CalculationMode.Auto:
            default:
                return getScalingValue(this.conditionScaling, this.stats) + prof
        }
    }

    public get conditionSaveValue(): number {
        return this.conditionModifierValue + 8
    }

    // Hit effect roll scaling

    public get effects(): IEffect[] {
        return this.metadata.effects ?? []
    }
}

export default CreatureActionData;